import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentSearchDto,
  Document,
  DocumentSearchResponse,
} from '@legal-docs/shared';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file to upload',
        },
        title: {
          type: 'string',
          description: 'Document title',
        },
        category: {
          type: 'string',
          enum: ['statute', 'judgement', 'circular', 'notification', 'contract', 'policy', 'other'],
          description: 'Document category',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Document tags',
        },
        jurisdiction: {
          type: 'string',
          description: 'Legal jurisdiction',
        },
        court: {
          type: 'string',
          description: 'Court name',
        },
        year: {
          type: 'number',
          description: 'Document year',
        },
        caseNumber: {
          type: 'string',
          description: 'Case number',
        },
        isPublic: {
          type: 'boolean',
          description: 'Whether document is public',
        },
        allowedUsers: {
          type: 'array',
          items: { type: 'string' },
          description: 'Users allowed to access this document',
        },
        allowedRoles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Roles allowed to access this document',
        },
      },
      required: ['file', 'title', 'category'],
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully', type: Document })
  @ApiResponse({ status: 400, description: 'Invalid file or data' })
  async upload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<Document> {
    return this.documentsService.create(createDocumentDto, file, req.user.sub);
  }

  @Post('judgement')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a judgement document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Judgement document uploaded successfully', type: Document })
  async uploadJudgement(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<Document> {
    const judgementDto = { ...createDocumentDto, category: 'judgement' as any };
    return this.documentsService.create(judgementDto, file, req.user.sub);
  }

  @Post('circular')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a circular document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Circular document uploaded successfully', type: Document })
  async uploadCircular(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<Document> {
    const circularDto = { ...createDocumentDto, category: 'circular' as any };
    return this.documentsService.create(circularDto, file, req.user.sub);
  }

  @Post('notification')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a notification document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Notification document uploaded successfully', type: Document })
  async uploadNotification(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<Document> {
    const notificationDto = { ...createDocumentDto, category: 'notification' as any };
    return this.documentsService.create(notificationDto, file, req.user.sub);
  }

  @Post('statute')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a statute document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Statute document uploaded successfully', type: Document })
  async uploadStatute(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<Document> {
    const statuteDto = { ...createDocumentDto, category: 'statute' as any };
    return this.documentsService.create(statuteDto, file, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents for current user' })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiQuery({ name: 'jurisdiction', required: false, type: String })
  @ApiQuery({ name: 'court', required: false, type: String })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async findAll(
    @Request() req: any,
    @Query() searchDto: DocumentSearchDto,
  ): Promise<DocumentSearchResponse> {
    return this.documentsService.findAll(req.user.sub, searchDto);
  }

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Search public documents' })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiQuery({ name: 'jurisdiction', required: false, type: String })
  @ApiQuery({ name: 'court', required: false, type: String })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Public documents retrieved successfully' })
  async findPublicDocuments(
    @Query() searchDto: DocumentSearchDto,
  ): Promise<DocumentSearchResponse> {
    return this.documentsService.searchPublicDocuments(searchDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get document statistics for current user' })
  @ApiResponse({ status: 200, description: 'Document statistics retrieved' })
  async getStats(@Request() req: any) {
    return this.documentsService.getStats(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully', type: Document })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findOne(@Param('id') id: string, @Request() req: any): Promise<Document> {
    return this.documentsService.findOne(id, req.user.sub);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get document download URL' })
  @ApiResponse({ status: 200, description: 'Download URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDownloadUrl(@Param('id') id: string, @Request() req: any): Promise<{ url: string }> {
    const url = await this.documentsService.getDownloadUrl(id, req.user.sub);
    return { url };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document' })
  @ApiResponse({ status: 200, description: 'Document updated successfully', type: Document })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req: any,
  ): Promise<Document> {
    return this.documentsService.update(id, updateDocumentDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async remove(@Param('id') id: string, @Request() req: any): Promise<{ message: string }> {
    await this.documentsService.remove(id, req.user.sub);
    return { message: 'Document deleted successfully' };
  }

  @Post(':id/convert-to-word')
  @ApiOperation({ summary: 'Convert document chunks to Word format' })
  @ApiResponse({ status: 200, description: 'Document converted to Word successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 400, description: 'Document not ready for conversion' })
  async convertToWord(@Param('id') id: string, @Request() req: any): Promise<{ wordUrl: string; wordKey: string }> {
    return this.documentsService.convertToWord(id, req.user.sub);
  }

  @Get(':id/word-url')
  @ApiOperation({ summary: 'Get Word document download URL' })
  @ApiResponse({ status: 200, description: 'Word document URL retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Word document not found' })
  async getWordDocumentUrl(@Param('id') id: string, @Request() req: any): Promise<{ wordUrl: string }> {
    const wordUrl = await this.documentsService.getWordDocumentUrl(id, req.user.sub);
    return { wordUrl };
  }
}
