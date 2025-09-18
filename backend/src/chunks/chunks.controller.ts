import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChunksService } from './chunks.service';
import { Chunk } from '@legal-docs/shared';

@ApiTags('Chunks')
@Controller('chunks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChunksController {
  constructor(private readonly chunksService: ChunksService) {}

  @Get('document/:documentId')
  @ApiOperation({ summary: 'Get chunks for a document' })
  @ApiResponse({ status: 200, description: 'Chunks retrieved successfully', type: [Chunk] })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocumentChunks(@Param('documentId') documentId: string, @Request() req: any): Promise<Chunk[]> {
    // TODO: Add authorization check to ensure user owns the document
    return this.chunksService.findByDocumentId(documentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chunk by ID' })
  @ApiResponse({ status: 200, description: 'Chunk retrieved successfully', type: Chunk })
  @ApiResponse({ status: 404, description: 'Chunk not found' })
  async getChunk(@Param('id') id: string): Promise<Chunk | null> {
    return this.chunksService.findById(id);
  }
}
