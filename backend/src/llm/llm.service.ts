import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { 
  LLMRequest, 
  LLMResponse, 
  SummarizationRequest, 
  SummarizationResponse,
  QARequest,
  QAResponse,
  FactMatchingRequest,
  FactMatchingResponse,
  LLMProvider,
  LLMModel,
  SummaryLength,
  DEFAULT_PROMPT_TEMPLATES,
  Citation,
  Source
} from '@legal-docs/shared';

export interface LLMProviderConfig {
  provider: LLMProvider;
  model: LLMModel;
  apiKey?: string;
  endpoint?: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private openaiClient: OpenAI;
  private config: LLMProviderConfig;

  constructor(private readonly configService: ConfigService) {
    this.initializeLLMProvider();
  }

  private initializeLLMProvider() {
    const provider = this.configService.get<string>('LLM_PROVIDER', 'openai') as LLMProvider;
    const model = this.configService.get<string>('LLM_MODEL', 'gpt-4') as LLMModel;

    this.config = {
      provider,
      model,
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      endpoint: this.configService.get<string>('LLM_ENDPOINT'),
      maxTokens: this.configService.get<number>('LLM_MAX_TOKENS', 4000),
      temperature: this.configService.get<number>('LLM_TEMPERATURE', 0.1),
      topP: this.configService.get<number>('LLM_TOP_P', 0.9),
      frequencyPenalty: this.configService.get<number>('LLM_FREQUENCY_PENALTY', 0),
      presencePenalty: this.configService.get<number>('LLM_PRESENCE_PENALTY', 0),
    };

    if (this.config.provider === 'openai' && this.config.apiKey) {
      this.openaiClient = new OpenAI({
        apiKey: this.config.apiKey,
      });
      this.logger.log('OpenAI LLM provider initialized');
    } else {
      this.logger.warn('LLM provider not properly configured, using mock responses');
    }
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      this.logger.log(`Generating LLM response with model: ${request.model}`);

      let response: LLMResponse;

      if (this.config.provider === 'openai' && this.openaiClient) {
        response = await this.generateOpenAIResponse(request);
      } else {
        response = await this.generateMockResponse(request);
      }

      response.processingTime = Date.now() - startTime;
      this.logger.log(`Generated LLM response in ${response.processingTime}ms`);

      return response;
    } catch (error) {
      this.logger.error(`Failed to generate LLM response: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to generate LLM response');
    }
  }

  async summarizeDocument(request: SummarizationRequest): Promise<SummarizationResponse> {
    this.logger.log(`Summarizing document ${request.documentId} with length: ${request.length}`);

    try {
      // Get document chunks (this would typically come from the chunks service)
      const chunks = await this.getDocumentChunks(request.documentId);
      
      // Combine chunks into context
      const context = chunks.map(chunk => ({
        text: chunk.chunkText,
        source: `Document ${request.documentId}`,
        pageNumbers: chunk.pageNumbers,
      }));

      // Get prompt template
      const template = DEFAULT_PROMPT_TEMPLATES.find(t => t.name === 'legal_summary');
      if (!template) {
        throw new BadRequestException('Summary template not found');
      }

      // Build prompt
      const prompt = this.buildPrompt(template.template, {
        documentTitle: `Document ${request.documentId}`,
        category: 'legal',
        content: context.map(c => c.text).join('\n\n'),
        length: request.length,
      });

      // Generate summary
      const llmRequest: LLMRequest = {
        prompt,
        model: this.config.model,
        provider: this.config.provider,
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
        context,
      };

      const response = await this.generateResponse(llmRequest);

      // Extract citations
      const citations = this.extractCitations(response.content, context);

      return {
        summary: response.content,
        length: request.length,
        citations,
        processingTime: response.processingTime,
        model: response.model,
        confidence: this.calculateConfidence(response.content),
      };
    } catch (error) {
      this.logger.error(`Failed to summarize document: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to summarize document');
    }
  }

  async answerQuestion(request: QARequest): Promise<QAResponse> {
    this.logger.log(`Answering question: "${request.question}"`);

    try {
      // Get relevant chunks based on question
      const relevantChunks = await this.getRelevantChunks(request.question, request.documentIds);
      
      // Build context
      const context = relevantChunks.map(chunk => ({
        text: chunk.chunkText,
        source: `Document ${chunk.documentId}`,
        pageNumbers: chunk.pageNumbers,
      }));

      // Get prompt template
      const template = DEFAULT_PROMPT_TEMPLATES.find(t => t.name === 'legal_qa');
      if (!template) {
        throw new BadRequestException('QA template not found');
      }

      // Build prompt
      const prompt = this.buildPrompt(template.template, {
        question: request.question,
        context: context.map(c => `${c.source}: ${c.text}`).join('\n\n'),
      });

      // Generate answer
      const llmRequest: LLMRequest = {
        prompt,
        model: this.config.model,
        provider: this.config.provider,
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
        context,
      };

      const response = await this.generateResponse(llmRequest);

      // Extract sources
      const sources = this.extractSources(response.content, context);

      return {
        answer: response.content,
        sources,
        confidence: this.calculateConfidence(response.content),
        processingTime: response.processingTime,
        model: response.model,
        relatedQuestions: this.generateRelatedQuestions(request.question),
      };
    } catch (error) {
      this.logger.error(`Failed to answer question: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to answer question');
    }
  }

  async matchFacts(request: FactMatchingRequest): Promise<FactMatchingResponse> {
    this.logger.log(`Matching ${request.facts.length} facts`);

    try {
      const matches = [];

      for (const fact of request.facts) {
        // Find relevant chunks for each fact
        const relevantChunks = await this.getRelevantChunks(fact, request.documentIds);
        
        if (relevantChunks.length > 0) {
          const overallScore = relevantChunks.reduce((sum, chunk) => sum + chunk.score, 0) / relevantChunks.length;
          
          matches.push({
            fact,
            documentId: relevantChunks[0].documentId,
            title: `Document ${relevantChunks[0].documentId}`,
            relevantChunks: relevantChunks.map(chunk => ({
              chunkId: chunk.chunkId,
              text: chunk.chunkText,
              pageNumbers: chunk.pageNumbers,
              score: chunk.score,
            })),
            overallScore,
          });
        }
      }

      return {
        matches,
        totalMatches: matches.length,
        processingTime: Date.now(),
      };
    } catch (error) {
      this.logger.error(`Failed to match facts: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to match facts');
    }
  }

  private async generateOpenAIResponse(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.openaiClient.chat.completions.create({
      model: request.model,
      messages: [
        {
          role: 'system',
          content: 'You are a legal expert assistant. Provide accurate, well-cited responses based on the provided context.',
        },
        {
          role: 'user',
          content: request.prompt,
        },
      ],
      max_tokens: request.maxTokens || this.config.maxTokens,
      temperature: request.temperature || this.config.temperature,
      top_p: request.topP || this.config.topP,
      frequency_penalty: request.frequencyPenalty || this.config.frequencyPenalty,
      presence_penalty: request.presencePenalty || this.config.presencePenalty,
    });

    return {
      content: response.choices[0].message.content || '',
      model: response.model,
      provider: this.config.provider,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      finishReason: response.choices[0].finish_reason || 'stop',
      processingTime: 0, // Will be set by caller
    };
  }

  private async generateMockResponse(request: LLMRequest): Promise<LLMResponse> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      content: `This is a mock response for the prompt: "${request.prompt.substring(0, 100)}..."`,
      model: request.model,
      provider: this.config.provider,
      usage: {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      },
      finishReason: 'stop',
      processingTime: 0,
    };
  }

  private buildPrompt(template: string, variables: Record<string, any>): string {
    let prompt = template;
    
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    
    return prompt;
  }

  private extractCitations(content: string, context: any[]): Citation[] {
    // Simple citation extraction - in reality, you'd use more sophisticated parsing
    const citations: Citation[] = [];
    
    context.forEach((item, index) => {
      if (content.includes(item.text.substring(0, 50))) {
        citations.push({
          text: item.text.substring(0, 100),
          source: item.source,
          pageNumbers: item.pageNumbers,
          confidence: 0.8,
          relevance: 0.9,
        });
      }
    });
    
    return citations;
  }

  private extractSources(content: string, context: any[]): Source[] {
    const sources: Source[] = [];
    
    context.forEach((item, index) => {
      if (content.includes(item.text.substring(0, 50))) {
        sources.push({
          documentId: item.source,
          title: `Document ${item.source}`,
          chunkId: `chunk_${index}`,
          text: item.text,
          pageNumbers: item.pageNumbers,
          score: 0.8,
        });
      }
    });
    
    return sources;
  }

  private calculateConfidence(content: string): number {
    // Simple confidence calculation based on content length and structure
    const hasCitations = content.includes('[') && content.includes(']');
    const hasReferences = content.includes('source') || content.includes('document');
    const length = content.length;
    
    let confidence = 0.5;
    if (hasCitations) confidence += 0.2;
    if (hasReferences) confidence += 0.2;
    if (length > 100) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private generateRelatedQuestions(question: string): string[] {
    // Simple related question generation
    return [
      `What are the key legal principles in ${question}?`,
      `How does ${question} relate to current law?`,
      `What are the implications of ${question}?`,
    ];
  }

  private async getDocumentChunks(documentId: string): Promise<any[]> {
    // This is a placeholder - in reality, you'd call the chunks service
    return [
      {
        chunkText: 'This is a sample chunk from the document.',
        pageNumbers: [1, 2],
        documentId,
      },
    ];
  }

  private async getRelevantChunks(query: string, documentIds?: string[]): Promise<any[]> {
    // This is a placeholder - in reality, you'd call the search service
    return [
      {
        chunkId: 'chunk_1',
        chunkText: 'This is a relevant chunk for the query.',
        pageNumbers: [1],
        documentId: documentIds?.[0] || 'doc_1',
        score: 0.9,
      },
    ];
  }
}
