import { Injectable, Logger } from '@nestjs/common';
import { VectorStoreService } from '../common/services/vector-store.service';
import { EmbeddingService } from '../common/services/embedding.service';
import { 
  VectorSearchDto, 
  VectorSearchResponse,
  EmbeddingRequest,
  EMBEDDING_MODELS
} from '@legal-docs/shared';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly vectorStoreService: VectorStoreService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async similaritySearch(searchDto: VectorSearchDto): Promise<VectorSearchResponse> {
    this.logger.log(`Performing similarity search for query: "${searchDto.query}"`);

    try {
      // Generate embedding for the search query
      const embeddingRequest: EmbeddingRequest = {
        text: searchDto.query,
        model: EMBEDDING_MODELS.OPENAI_ADA_002, // TODO: Make configurable
      };

      const queryEmbedding = await this.embeddingService.generateEmbedding(embeddingRequest);

      // Perform vector search
      const searchResult = await this.vectorStoreService.searchVectors({
        ...searchDto,
        queryEmbedding: queryEmbedding.embedding,
      });

      this.logger.log(`Found ${searchResult.results.length} results for query: "${searchDto.query}"`);

      return searchResult;
    } catch (error) {
      this.logger.error(`Failed to perform similarity search: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getVectorStoreStats(): Promise<any> {
    try {
      return await this.vectorStoreService.getCollectionStats();
    } catch (error) {
      this.logger.error(`Failed to get vector store stats: ${error.message}`, error.stack);
      throw error;
    }
  }
}
