import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChunksService } from './chunks.service';

@ApiTags('Chunks')
@Controller('chunks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChunksController {
  constructor(private readonly chunksService: ChunksService) {}

  @Get('document/:documentId')
  @ApiOperation({ summary: 'Get chunks for a document' })
  @ApiResponse({ status: 200, description: 'Chunks retrieved successfully' })
  async getDocumentChunks(@Param('documentId') documentId: string) {
    return { message: `Get chunks for document ${documentId} - to be implemented` };
  }
}
