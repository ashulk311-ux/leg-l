import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChunkDocument = Chunk & Document;

@Schema({ timestamps: true })
export class Chunk {
  @Prop({ required: true })
  documentId: string;

  @Prop({ required: true })
  chunkText: string;

  @Prop({ required: true })
  startPos: number;

  @Prop({ required: true })
  endPos: number;

  @Prop({ type: [Number], default: [] })
  pageNumbers: number[];

  @Prop({ required: true })
  tokenCount: number;

  @Prop()
  embeddingId?: string;

  @Prop()
  vectorId?: string;

  @Prop({
    type: {
      chunkIndex: { type: Number, required: true },
      isHeader: { type: Boolean, default: false },
      isFooter: { type: Boolean, default: false },
      isTable: { type: Boolean, default: false },
      isList: { type: Boolean, default: false },
      confidence: { type: Number, min: 0, max: 1 },
      language: { type: String },
      entities: {
        type: [{
          text: String,
          type: String,
          start: Number,
          end: Number,
        }],
        default: [],
      },
    },
  })
  metadata?: any;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ChunkSchema = SchemaFactory.createForClass(Chunk);

// Indexes
ChunkSchema.index({ documentId: 1 });
ChunkSchema.index({ embeddingId: 1 });
ChunkSchema.index({ vectorId: 1 });
ChunkSchema.index({ createdAt: -1 });
