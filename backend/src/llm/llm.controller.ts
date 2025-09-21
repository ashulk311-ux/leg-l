import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LlmService } from './llm.service';
import { 
  SummarizationRequest, 
  SummarizationResponse,
  QARequest,
  QAResponse,
  FactMatchingRequest,
  FactMatchingResponse,
  LLMRequest,
  LLMResponse
} from '@legal-docs/shared';

@ApiTags('LLM')
@Controller('llm')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate LLM response' })
  @ApiResponse({ status: 200, description: 'LLM response generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  async generateResponse(@Body() request: LLMRequest): Promise<LLMResponse> {
    return this.llmService.generateResponse(request);
  }

  @Post('summarize')
  @ApiOperation({ summary: 'Summarize a document' })
  @ApiResponse({ status: 200, description: 'Document summarized successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  async summarize(@Body() request: SummarizationRequest): Promise<SummarizationResponse> {
    return this.llmService.summarizeDocument(request);
  }

  @Post('qa')
  @ApiOperation({ summary: 'Answer questions about documents' })
  @ApiResponse({ status: 200, description: 'Question answered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  async qa(@Body() request: QARequest): Promise<QAResponse> {
    return this.llmService.answerQuestion(request);
  }

  @Post('match-facts')
  @ApiOperation({ summary: 'Match facts against documents' })
  @ApiResponse({ status: 200, description: 'Facts matched successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  async matchFacts(@Body() request: FactMatchingRequest): Promise<FactMatchingResponse> {
    return this.llmService.matchFacts(request);
  }
}
