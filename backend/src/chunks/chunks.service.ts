import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { DocumentChunk, ChunkDocument } from './schemas/chunk.schema';
import { EmbeddingService } from '../common/services/embedding.service';
import { VectorStoreService, VectorDocument } from '../common/services/vector-store.service';
import { 
  CreateChunkDto, 
  Chunk, 
  DEFAULT_CHUNKING_CONFIG,
  ChunkingConfig,
  EmbeddingRequest,
  EMBEDDING_MODELS
} from '@legal-docs/shared';

@Injectable()
export class ChunksService {
  private readonly logger = new Logger(ChunksService.name);

  constructor(
    @InjectModel(DocumentChunk.name) private readonly chunkModel: Model<ChunkDocument>,
    private readonly configService: ConfigService,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStoreService: VectorStoreService,
  ) {}

  async createChunks(documentId: string, text: string): Promise<Chunk[]> {
    this.logger.log(`Creating chunks for document ${documentId}`);

    const config: ChunkingConfig = {
      maxChunkSize: this.configService.get<number>('CHUNK_SIZE', DEFAULT_CHUNKING_CONFIG.maxChunkSize),
      overlapSize: this.configService.get<number>('CHUNK_OVERLAP', DEFAULT_CHUNKING_CONFIG.overlapSize),
      strategy: this.configService.get<string>('CHUNKING_STRATEGY', DEFAULT_CHUNKING_CONFIG.strategy) as any,
      preserveFormatting: this.configService.get<boolean>('PRESERVE_FORMATTING', DEFAULT_CHUNKING_CONFIG.preserveFormatting),
      removeHeaders: this.configService.get<boolean>('REMOVE_HEADERS', DEFAULT_CHUNKING_CONFIG.removeHeaders),
      removeFooters: this.configService.get<boolean>('REMOVE_FOOTERS', DEFAULT_CHUNKING_CONFIG.removeFooters),
      minChunkSize: this.configService.get<number>('MIN_CHUNK_SIZE', DEFAULT_CHUNKING_CONFIG.minChunkSize),
    };

    // Clean and preprocess text
    const cleanedText = this.preprocessText(text, config);

    // Create chunks based on strategy
    const chunkTexts = this.createChunkTexts(cleanedText, config);

    // Create chunk documents
    const chunks: Chunk[] = [];
    let chunkIndex = 0;

    for (const chunkText of chunkTexts) {
      const chunk = new this.chunkModel({
        documentId,
        chunkText,
        startPos: chunkIndex * (config.maxChunkSize - config.overlapSize),
        endPos: chunkIndex * (config.maxChunkSize - config.overlapSize) + chunkText.length,
        tokenCount: this.countTokens(chunkText),
        metadata: {
          chunkIndex,
          isHeader: this.isHeader(chunkText),
          isFooter: this.isFooter(chunkText),
          isTable: this.isTable(chunkText),
          isList: this.isList(chunkText),
          confidence: 1.0,
          language: 'en',
          entities: [],
        },
      });

      const savedChunk = await chunk.save();
      chunks.push(savedChunk as any);
      chunkIndex++;
    }

    this.logger.log(`Created ${chunks.length} chunks for document ${documentId}`);
    return chunks;
  }

  async generateEmbeddings(chunks: Chunk[]): Promise<void> {
    this.logger.log(`Generating embeddings for ${chunks.length} chunks`);

    try {
      // Prepare embedding requests
      const embeddingRequests: EmbeddingRequest[] = chunks.map(chunk => ({
        text: chunk.chunkText,
        model: this.configService.get<string>('EMBEDDING_MODEL', EMBEDDING_MODELS.OPENAI_ADA_002),
        chunkId: (chunk as any)._id?.toString(),
      }));

      // Generate embeddings in batches
      const batchSize = this.configService.get<number>('EMBEDDING_BATCH_SIZE', 10);
      const batches = this.createBatches(embeddingRequests, batchSize);

      for (const batch of batches) {
        const embeddingResponses = await this.embeddingService.generateBatchEmbeddings(batch);
        
        // Update chunks with embedding information
        for (let i = 0; i < batch.length; i++) {
          const request = batch[i];
          const response = embeddingResponses[i];
          
          await this.chunkModel.findByIdAndUpdate(request.chunkId, {
            embeddingId: `embedding_${request.chunkId}_${Date.now()}`,
            vectorId: `vector_${request.chunkId}`,
          }).exec();
        }
      }

      this.logger.log(`Generated embeddings for ${chunks.length} chunks`);
    } catch (error) {
      this.logger.error(`Failed to generate embeddings: ${error.message}`, error.stack);
      throw error;
    }
  }

  async indexChunks(chunks: Chunk[]): Promise<void> {
    this.logger.log(`Indexing ${chunks.length} chunks in vector store`);

    try {
      // Prepare vector documents for indexing
      const vectorDocuments: VectorDocument[] = [];

      for (const chunk of chunks) {
        // Generate embedding for the chunk
        const embeddingRequest: EmbeddingRequest = {
          text: chunk.chunkText,
          model: this.configService.get<string>('EMBEDDING_MODEL', EMBEDDING_MODELS.OPENAI_ADA_002),
          chunkId: (chunk as any)._id?.toString(),
        };

        const embeddingResponse = await this.embeddingService.generateEmbedding(embeddingRequest);

        // Create vector document
        const vectorDoc: VectorDocument = {
          id: `vector_${(chunk as any)._id}_${Date.now()}`,
          vector: embeddingResponse.embedding,
          metadata: {
            chunkId: (chunk as any)._id?.toString() || '',
            documentId: chunk.documentId,
            text: chunk.chunkText,
            title: 'Document Title', // TODO: Get from document
            category: 'legal', // TODO: Get from document
            tags: [], // TODO: Get from document
            pageNumbers: chunk.pageNumbers,
            createdAt: new Date(),
          },
        };

        vectorDocuments.push(vectorDoc);

        // Update chunk with vector ID
        await this.chunkModel.findByIdAndUpdate((chunk as any)._id, {
          vectorId: vectorDoc.id,
        }).exec();
      }

      // Insert vectors into vector store
      await this.vectorStoreService.insertVectors(vectorDocuments);

      this.logger.log(`Indexed ${chunks.length} chunks in vector store`);
    } catch (error) {
      this.logger.error(`Failed to index chunks: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByDocumentId(documentId: string): Promise<Chunk[]> {
    return this.chunkModel.find({ documentId }).sort({ 'metadata.chunkIndex': 1 }).exec() as any;
  }

  async findById(id: string): Promise<Chunk | null> {
    return this.chunkModel.findById(id).exec() as any;
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.chunkModel.deleteMany({ documentId }).exec();
  }

  private preprocessText(text: string, config: ChunkingConfig): string {
    let processedText = text;

    // Remove extra whitespace
    processedText = processedText.replace(/\s+/g, ' ').trim();

    // Remove headers and footers if configured
    if (config.removeHeaders) {
      processedText = this.removeHeaders(processedText);
    }

    if (config.removeFooters) {
      processedText = this.removeFooters(processedText);
    }

    return processedText;
  }

  private createChunkTexts(text: string, config: ChunkingConfig): string[] {
    const chunks: string[] = [];
    const words = text.split(' ');
    let currentChunk: string[] = [];
    let currentSize = 0;

    for (const word of words) {
      if (currentSize + word.length + 1 > config.maxChunkSize) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.join(' '));
          
          // Add overlap
          if (config.overlapSize > 0) {
            const overlapWords = currentChunk.slice(-config.overlapSize);
            currentChunk = overlapWords;
            currentSize = overlapWords.join(' ').length;
          } else {
            currentChunk = [];
            currentSize = 0;
          }
        }
      }

      currentChunk.push(word);
      currentSize += word.length + 1;
    }

    // Add the last chunk
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    // Filter out chunks that are too small
    return chunks.filter(chunk => chunk.length >= config.minChunkSize);
  }

  private countTokens(text: string): number {
    // Simple token counting - in reality, you'd use a proper tokenizer
    return text.split(' ').length;
  }

  private isHeader(text: string): boolean {
    // Simple heuristic to detect headers
    return text.length < 100 && text.split('\n').length <= 2;
  }

  private isFooter(text: string): boolean {
    // Simple heuristic to detect footers
    return text.length < 100 && text.includes('page') || text.includes('Page');
  }

  private isTable(text: string): boolean {
    // Simple heuristic to detect tables
    return text.includes('|') || text.includes('\t');
  }

  private isList(text: string): boolean {
    // Simple heuristic to detect lists
    return /^\s*[\d\w]+\.\s/.test(text) || /^\s*[-*]\s/.test(text);
  }

  private removeHeaders(text: string): string {
    // Remove common header patterns
    const lines = text.split('\n');
    const filteredLines = lines.filter(line => {
      const trimmed = line.trim();
      return !(
        trimmed.length < 50 && (
          trimmed.includes('Page') ||
          trimmed.includes('Document') ||
          trimmed.includes('Case') ||
          trimmed.match(/^\d+$/)
        )
      );
    });
    return filteredLines.join('\n');
  }

  private removeFooters(text: string): string {
    // Remove common footer patterns
    const lines = text.split('\n');
    const filteredLines = lines.filter(line => {
      const trimmed = line.trim();
      return !(
        trimmed.length < 50 && (
          trimmed.includes('Page') ||
          trimmed.includes('page') ||
          trimmed.match(/^\d+\s*$/)
        )
      );
    });
    return filteredLines.join('\n');
  }

  /**
   * Save chunks created by Python processor
   */
  async saveChunksFromPython(documentId: string, pythonChunks: any[]): Promise<any[]> {
    this.logger.log(`Saving ${pythonChunks.length} chunks from Python processor for document ${documentId}`);

    const savedChunks = [];

    for (const pythonChunk of pythonChunks) {
      const chunk = new this.chunkModel({
        documentId,
        chunkText: pythonChunk.chunkText,
        startPos: pythonChunk.startPos,
        endPos: pythonChunk.endPos,
        tokenCount: pythonChunk.tokenCount,
        metadata: pythonChunk.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedChunk = await chunk.save();
      savedChunks.push(savedChunk);
    }

    this.logger.log(`Successfully saved ${savedChunks.length} chunks for document ${documentId}`);
    return savedChunks;
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
}
