import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LlmService } from './llm.service';

@ApiTags('LLM')
@Controller('llm')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post('summarize')
  @ApiOperation({ summary: 'Summarize a document' })
  @ApiResponse({ status: 200, description: 'Document summarized successfully' })
  async summarize(@Body() body: any) {
    return { message: 'Document summarization endpoint - to be implemented' };
  }

  @Post('qa')
  @ApiOperation({ summary: 'Answer questions about documents' })
  @ApiResponse({ status: 200, description: 'Question answered successfully' })
  async qa(@Body() body: any) {
    return { message: 'Q&A endpoint - to be implemented' };
  }
}
