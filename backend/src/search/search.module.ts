import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { EmbeddingService } from '../common/services/embedding.service';
import { VectorStoreService } from '../common/services/vector-store.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, EmbeddingService, VectorStoreService],
  exports: [SearchService, EmbeddingService, VectorStoreService],
})
export class SearchModule {}
