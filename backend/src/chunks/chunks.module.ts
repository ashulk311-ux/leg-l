import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChunksController } from './chunks.controller';
import { ChunksService } from './chunks.service';
import { Chunk, ChunkSchema } from './schemas/chunk.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chunk.name, schema: ChunkSchema }]),
  ],
  controllers: [ChunksController],
  providers: [ChunksService],
  exports: [ChunksService],
})
export class ChunksModule {}
