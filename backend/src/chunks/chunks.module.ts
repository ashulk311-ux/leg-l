import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChunksController } from './chunks.controller';
import { ChunksService } from './chunks.service';
import { Chunk, ChunkSchema } from './schemas/chunk.schema';
import { EmbeddingService } from '../common/services/embedding.service';
import { VectorStoreService } from '../common/services/vector-store.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chunk.name, schema: ChunkSchema }]),
  ],
  controllers: [ChunksController],
  providers: [ChunksService, EmbeddingService, VectorStoreService],
  exports: [ChunksService, EmbeddingService, VectorStoreService],
})
export class ChunksModule {}
