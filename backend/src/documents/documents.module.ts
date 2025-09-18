import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';

import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document, DocumentSchema } from './schemas/document.schema';
import { StorageService } from '../common/services/storage.service';
import { DocumentProcessor } from './processors/document.processor';
import { ChunksModule } from '../chunks/chunks.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Document.name, schema: DocumentSchema }]),
    BullModule.registerQueue({
      name: 'document-processing',
    }),
    ChunksModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, StorageService, DocumentProcessor],
  exports: [DocumentsService, StorageService],
})
export class DocumentsModule {}
