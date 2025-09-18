import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('similarity')
  @ApiOperation({ summary: 'Perform similarity search' })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  async similaritySearch(@Body() body: any) {
    return { message: 'Similarity search endpoint - to be implemented' };
  }
}
