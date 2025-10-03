import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { LegalDocument, DocumentDocument } from './schemas/document.schema';
import { StorageService } from '../common/services/storage.service';
import { WordConversionService } from '../common/services/word-conversion.service';
import { ChunksService } from '../chunks/chunks.service';
import { 
  CreateDocumentDto, 
  UpdateDocumentDto, 
  DocumentSearchDto,
  DocumentSearchResponse,
  DocumentStatus,
  DocumentCategory,
  DocumentType,
  DocumentFilters
} from '@legal-docs/shared';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectModel(LegalDocument.name) private readonly documentModel: Model<DocumentDocument>,
    private readonly storageService: StorageService,
    @InjectQueue('document-processing') private readonly documentQueue: Queue,
    private readonly wordConversionService: WordConversionService,
    private readonly chunksService: ChunksService,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<LegalDocument> {
    try {
      // Upload file to storage
      const uploadResult = await this.storageService.uploadFile(file, 'documents');

      // Create document record
      const document = new this.documentModel({
        ...createDocumentDto,
        ownerId: userId,
        filename: uploadResult.key,
        originalFilename: file.originalname,
        s3Key: uploadResult.key,
        s3Bucket: uploadResult.bucket,
        type: this.getDocumentType(file.mimetype),
        status: DocumentStatus.UPLOADED,
        metadata: {
          size: uploadResult.size,
          mimeType: uploadResult.mimeType,
          jurisdiction: createDocumentDto.jurisdiction,
          court: createDocumentDto.court,
          year: createDocumentDto.year,
          caseNumber: createDocumentDto.caseNumber,
          tags: createDocumentDto.tags || [],
          ocrUsed: false,
          uploadedAt: new Date(),
        },
        uploadedAt: new Date(),
        permissions: {
          isPublic: createDocumentDto.isPublic || false,
          allowedUsers: createDocumentDto.allowedUsers || [],
          allowedRoles: createDocumentDto.allowedRoles || [],
        },
      });

      const savedDocument = await document.save();

      // Queue document for processing
      await this.documentQueue.add('process-document', {
        documentId: savedDocument._id.toString(),
        s3Key: uploadResult.key,
        s3Bucket: uploadResult.bucket,
        mimeType: uploadResult.mimeType,
      });

      this.logger.log(`Document ${savedDocument._id} created and queued for processing`);

      return savedDocument;
    } catch (error) {
      this.logger.error(`Failed to create document: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create document');
    }
  }

  async findAll(
    userId: string,
    searchDto: DocumentSearchDto,
  ): Promise<DocumentSearchResponse> {
    const {
      query,
      category,
      tags,
      jurisdiction,
      court,
      year,
      status,
      isPublic,
      page = 1,
      limit = 20,
      sortBy = 'uploadedAt',
      sortOrder = 'desc',
    } = searchDto;

    // Build query
    const filter: any = { ownerId: userId };

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { 'metadata.extractedText': { $regex: query, $options: 'i' } },
        { 'metadata.tags': { $in: [new RegExp(query, 'i')] } },
      ];
    }

    if (category) filter.category = category;
    if (tags && tags.length > 0) filter['metadata.tags'] = { $in: tags };
    if (jurisdiction) filter['metadata.jurisdiction'] = jurisdiction;
    if (court) filter['metadata.court'] = court;
    if (year) filter['metadata.year'] = year;
    if (status) filter.status = status;
    if (isPublic !== undefined) filter['permissions.isPublic'] = isPublic;

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const skip = (page - 1) * limit;
    const [documents, total] = await Promise.all([
      this.documentModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.documentModel.countDocuments(filter).exec(),
    ]);

    return {
      documents: documents as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<LegalDocument> {
    const document = await this.documentModel.findOne({
      _id: id,
      ownerId: userId,
    }).exec();

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async findOneById(id: string): Promise<LegalDocument> {
    const document = await this.documentModel.findById(id).exec();

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto, userId: string): Promise<LegalDocument> {
    const document = await this.documentModel.findOneAndUpdate(
      { _id: id, ownerId: userId },
      { ...updateDocumentDto, updatedAt: new Date() },
      { new: true },
    ).exec();

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async remove(id: string, userId: string): Promise<void> {
    const document = await this.documentModel.findOne({
      _id: id,
      ownerId: userId,
    }).exec();

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Delete file from storage
    try {
      await this.storageService.deleteFile(document.s3Key);
    } catch (error) {
      this.logger.warn(`Failed to delete file from storage: ${error.message}`);
    }

    // Delete document record
    await this.documentModel.findByIdAndDelete(id).exec();
  }

  async getDownloadUrl(id: string, userId: string): Promise<string> {
    const document = await this.findOne(id, userId);
    return this.storageService.getFileUrl(document.s3Key);
  }

  async updateStatus(id: string, status: DocumentStatus, metadata?: any): Promise<LegalDocument> {
    const updateData: any = { status, updatedAt: new Date() };
    
    if (metadata) {
      updateData.metadata = { ...updateData.metadata, ...metadata };
    }

    if (status === DocumentStatus.PROCESSING) {
      updateData.processedAt = new Date();
    } else if (status === DocumentStatus.INDEXED) {
      updateData.indexedAt = new Date();
    }

    const document = await this.documentModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async getStats(userId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    totalSize: number;
  }> {
    const [total, byStatus, byCategory, sizeStats] = await Promise.all([
      this.documentModel.countDocuments({ ownerId: userId }).exec(),
      this.documentModel.aggregate([
        { $match: { ownerId: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]).exec(),
      this.documentModel.aggregate([
        { $match: { ownerId: userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]).exec(),
      this.documentModel.aggregate([
        { $match: { ownerId: userId } },
        { $group: { _id: null, totalSize: { $sum: '$metadata.size' } } },
      ]).exec(),
    ]);

    const statusStats = byStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const categoryStats = byCategory.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      total,
      byStatus: statusStats,
      byCategory: categoryStats,
      totalSize: sizeStats[0]?.totalSize || 0,
    };
  }

  async searchPublicDocuments(searchDto: DocumentSearchDto): Promise<DocumentSearchResponse> {
    const {
      query,
      category,
      tags,
      jurisdiction,
      court,
      year,
      page = 1,
      limit = 20,
      sortBy = 'uploadedAt',
      sortOrder = 'desc',
    } = searchDto;

    // Build query for public documents only
    const filter: any = { 'permissions.isPublic': true };

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { 'metadata.extractedText': { $regex: query, $options: 'i' } },
        { 'metadata.tags': { $in: [new RegExp(query, 'i')] } },
      ];
    }

    if (category) filter.category = category;
    if (tags && tags.length > 0) filter['metadata.tags'] = { $in: tags };
    if (jurisdiction) filter['metadata.jurisdiction'] = jurisdiction;
    if (court) filter['metadata.court'] = court;
    if (year) filter['metadata.year'] = year;

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const skip = (page - 1) * limit;
    const [documents, total] = await Promise.all([
      this.documentModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('ownerId', 'name email')
        .exec(),
      this.documentModel.countDocuments(filter).exec(),
    ]);

    return {
      documents: documents as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Convert document chunks to Word format
   */
  async convertToWord(id: string, userId: string): Promise<{ wordUrl: string; wordKey: string }> {
    const document = await this.findOne(id, userId);
    
    if (document.status !== DocumentStatus.INDEXED) {
      throw new BadRequestException('Document must be fully processed before conversion');
    }

    try {
      // Get document chunks
      const chunks = await this.chunksService.findByDocumentId(id);
      
      if (!chunks || chunks.length === 0) {
        throw new BadRequestException('No chunks found for this document');
      }

      // Convert chunks to Word format
      const wordBuffer = await this.wordConversionService.convertChunksToWord(id, chunks);
      
      // Store Word document
      const wordKey = await this.wordConversionService.storeWordDocument(id, wordBuffer);
      
      // Get download URL
      const wordUrl = await this.storageService.getFileUrl(wordKey);
      
      // Update document metadata with Word document info
      await this.documentModel.findByIdAndUpdate(id, {
        $set: {
          'metadata.wordDocumentKey': wordKey,
          'metadata.wordDocumentUrl': wordUrl,
          'metadata.wordConvertedAt': new Date(),
        }
      });

      this.logger.log(`Document ${id} converted to Word format successfully`);
      
      return { wordUrl, wordKey };
    } catch (error) {
      this.logger.error(`Failed to convert document ${id} to Word format: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to convert document to Word format');
    }
  }

  /**
   * Get Word document download URL
   */
  async getWordDocumentUrl(id: string, userId: string): Promise<string> {
    const document = await this.findOne(id, userId);
    
    if (!document.metadata?.wordDocumentKey) {
      throw new NotFoundException('Word document not found. Please convert the document first.');
    }

    return this.storageService.getFileUrl(document.metadata.wordDocumentKey);
  }

  private getDocumentType(mimeType: string): DocumentType {
    const mimeTypeMap: Record<string, DocumentType> = {
      'application/pdf': DocumentType.PDF,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': DocumentType.DOCX,
      'application/msword': DocumentType.DOCX,
      'text/plain': DocumentType.TXT,
      'image/jpeg': DocumentType.JPEG,
      'image/jpg': DocumentType.JPG,
      'image/png': DocumentType.PNG,
      'image/tiff': DocumentType.TIFF,
    };

    return mimeTypeMap[mimeType] || DocumentType.TXT;
  }
}