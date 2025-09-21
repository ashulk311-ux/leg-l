import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';
import { VectorSearchDto, VectorSearchResponse } from '@legal-docs/shared';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('similarity')
  @ApiOperation({ summary: 'Perform similarity search' })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  @ApiResponse({ status: 400, description: 'Invalid search parameters' })
  async similaritySearch(@Body() searchDto: VectorSearchDto): Promise<VectorSearchResponse> {
    return this.searchService.similaritySearch(searchDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get vector store statistics' })
  @ApiResponse({ status: 200, description: 'Vector store statistics retrieved' })
  async getVectorStoreStats() {
    return this.searchService.getVectorStoreStats();
  }
}
