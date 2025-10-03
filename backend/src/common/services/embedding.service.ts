import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import axios from 'axios';
import { 
  EmbeddingRequest, 
  EmbeddingResponse, 
  EMBEDDING_MODELS,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE 
} from '@legal-docs/shared';

export interface EmbeddingProvider {
  name: string;
  generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  generateBatchEmbeddings(requests: EmbeddingRequest[]): Promise<EmbeddingResponse[]>;
}

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private openaiClient: OpenAI;
  private providers: Map<string, EmbeddingProvider> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize OpenAI provider
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (openaiApiKey) {
      this.openaiClient = new OpenAI({
        apiKey: openaiApiKey,
      });
      this.providers.set('openai', new OpenAIEmbeddingProvider(this.openaiClient));
      this.logger.log('OpenAI embedding provider initialized');
    }

    // Initialize local embedding provider (placeholder for sentence-transformers)
    this.providers.set('local', new LocalEmbeddingProvider());
    this.logger.log('Local embedding provider initialized');

    // Initialize custom API provider
    const customApiUrl = this.configService.get<string>('CUSTOM_EMBEDDING_API_URL');
    if (customApiUrl) {
      this.providers.set('custom', new CustomAPIEmbeddingProvider(customApiUrl));
      this.logger.log('Custom API embedding provider initialized');
    }
  }

  async generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const providerName = this.configService.get<string>('EMBEDDING_PROVIDER', 'openai');
    let provider = this.providers.get(providerName);

    // Fallback to local provider if the requested provider is not available
    if (!provider) {
      this.logger.warn(`Embedding provider '${providerName}' not available, falling back to local provider`);
      provider = this.providers.get('local');
      
      if (!provider) {
        throw new BadRequestException(`No embedding providers available`);
      }
    }

    try {
      this.logger.log(`Generating embedding for chunk ${request.chunkId || 'unknown'}`);
      const response = await provider.generateEmbedding(request);
      this.logger.log(`Generated embedding with ${response.embedding.length} dimensions`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to generate embedding');
    }
  }

  async generateBatchEmbeddings(requests: EmbeddingRequest[]): Promise<EmbeddingResponse[]> {
    const providerName = this.configService.get<string>('EMBEDDING_PROVIDER', 'openai');
    let provider = this.providers.get(providerName);

    // Fallback to local provider if the requested provider is not available
    if (!provider) {
      this.logger.warn(`Embedding provider '${providerName}' not available, falling back to local provider`);
      provider = this.providers.get('local');
      
      if (!provider) {
        throw new BadRequestException(`No embedding providers available`);
      }
    }

    try {
      this.logger.log(`Generating batch embeddings for ${requests.length} chunks`);
      const responses = await provider.generateBatchEmbeddings(requests);
      this.logger.log(`Generated ${responses.length} embeddings`);
      return responses;
    } catch (error) {
      this.logger.error(`Failed to generate batch embeddings: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to generate batch embeddings');
    }
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  getProviderInfo(providerName: string): any {
    const provider = this.providers.get(providerName);
    if (!provider) {
      return null;
    }

    return {
      name: providerName,
      available: true,
      models: this.getAvailableModels(providerName),
    };
  }

  private getAvailableModels(providerName: string): string[] {
    switch (providerName) {
      case 'openai':
        return [
          EMBEDDING_MODELS.OPENAI_ADA_002,
          EMBEDDING_MODELS.OPENAI_3_SMALL,
          EMBEDDING_MODELS.OPENAI_3_LARGE,
        ];
      case 'local':
        return [
          EMBEDDING_MODELS.SENTENCE_TRANSFORMERS_ALL_MPNET,
          EMBEDDING_MODELS.SENTENCE_TRANSFORMERS_ALL_MINILM,
        ];
      default:
        return [];
    }
  }
}

class OpenAIEmbeddingProvider implements EmbeddingProvider {
  name = 'openai';

  constructor(private readonly openaiClient: OpenAI) {}

  async generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const model = request.model || EMBEDDING_MODELS.OPENAI_ADA_002;
    
    const response = await this.openaiClient.embeddings.create({
      model,
      input: request.text,
      encoding_format: 'float',
    });

    return {
      embedding: response.data[0].embedding,
      model: response.model,
      tokenCount: response.usage.total_tokens,
      chunkId: request.chunkId,
    };
  }

  async generateBatchEmbeddings(requests: EmbeddingRequest[]): Promise<EmbeddingResponse[]> {
    const model = requests[0]?.model || EMBEDDING_MODELS.OPENAI_ADA_002;
    const texts = requests.map(req => req.text);

    const response = await this.openaiClient.embeddings.create({
      model,
      input: texts,
      encoding_format: 'float',
    });

    return response.data.map((item, index) => ({
      embedding: item.embedding,
      model: response.model,
      tokenCount: response.usage.total_tokens / texts.length,
      chunkId: requests[index].chunkId,
    }));
  }
}

class LocalEmbeddingProvider implements EmbeddingProvider {
  name = 'local';

  async generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    // This is a placeholder for local embedding generation
    // In a real implementation, you would use sentence-transformers or similar
    
    // Simulate embedding generation
    const embedding = this.generateMockEmbedding(request.text);
    
    return {
      embedding,
      model: EMBEDDING_MODELS.SENTENCE_TRANSFORMERS_ALL_MPNET,
      tokenCount: this.countTokens(request.text),
      chunkId: request.chunkId,
    };
  }

  async generateBatchEmbeddings(requests: EmbeddingRequest[]): Promise<EmbeddingResponse[]> {
    const responses: EmbeddingResponse[] = [];
    
    for (const request of requests) {
      const response = await this.generateEmbedding(request);
      responses.push(response);
    }
    
    return responses;
  }

  private generateMockEmbedding(text: string): number[] {
    // Generate a mock 768-dimensional embedding
    const embedding = new Array(768);
    const hash = this.simpleHash(text);
    
    for (let i = 0; i < 768; i++) {
      embedding[i] = Math.sin(hash + i) * 0.1;
    }
    
    return embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private countTokens(text: string): number {
    // Simple token counting - in reality, you'd use a proper tokenizer
    return text.split(' ').length;
  }
}

class CustomAPIEmbeddingProvider implements EmbeddingProvider {
  name = 'custom';

  constructor(private readonly apiUrl: string) {}

  async generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    try {
      const response = await axios.post(`${this.apiUrl}/embeddings`, {
        text: request.text,
        model: request.model,
      });

      return {
        embedding: response.data.embedding,
        model: response.data.model || request.model,
        tokenCount: response.data.tokenCount || this.countTokens(request.text),
        chunkId: request.chunkId,
      };
    } catch (error) {
      throw new Error(`Custom API embedding failed: ${error.message}`);
    }
  }

  async generateBatchEmbeddings(requests: EmbeddingRequest[]): Promise<EmbeddingResponse[]> {
    try {
      const response = await axios.post(`${this.apiUrl}/embeddings/batch`, {
        texts: requests.map(req => req.text),
        model: requests[0]?.model,
      });

      return response.data.embeddings.map((embedding: number[], index: number) => ({
        embedding,
        model: response.data.model || requests[index].model,
        tokenCount: response.data.tokenCounts?.[index] || this.countTokens(requests[index].text),
        chunkId: requests[index].chunkId,
      }));
    } catch (error) {
      throw new Error(`Custom API batch embedding failed: ${error.message}`);
    }
  }

  private countTokens(text: string): number {
    return text.split(' ').length;
  }
}
