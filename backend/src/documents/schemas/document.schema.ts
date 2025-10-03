import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';
import { DocumentCategory, DocumentStatus, DocumentType } from '@legal-docs/shared';

export type DocumentDocument = LegalDocument & MongooseDocument;

@Schema({ timestamps: true })
export class LegalDocument {
  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalFilename: string;

  @Prop({ required: true })
  s3Key: string;

  @Prop({ required: true })
  s3Bucket: string;

  @Prop({ type: String, required: true, enum: DocumentCategory })
  category: DocumentCategory;

  @Prop({ type: String, required: true, enum: DocumentType })
  type: DocumentType;

  @Prop({ type: String, required: true, enum: DocumentStatus, default: DocumentStatus.UPLOADED })
  status: DocumentStatus;

  @Prop({
    type: {
      size: { type: Number, required: true },
      mimeType: { type: String, required: true },
      pages: { type: Number },
      language: { type: String },
      jurisdiction: { type: String },
      court: { type: String },
      year: { type: Number },
      caseNumber: { type: String },
      tags: { type: [String], default: [] },
      extractedText: { type: String },
      ocrUsed: { type: Boolean, default: false },
      processingTime: { type: Number },
      errorMessage: { type: String },
      wordDocumentKey: { type: String },
      wordDocumentUrl: { type: String },
      wordConvertedAt: { type: Date },
    },
  })
  metadata: any;

  @Prop({
    type: {
      isPublic: { type: Boolean, default: false },
      allowedUsers: { type: [String], default: [] },
      allowedRoles: { type: [String], default: [] },
    },
  })
  permissions?: any;

  @Prop({ type: Date, default: Date.now })
  uploadedAt: Date;

  @Prop({ type: Date })
  processedAt?: Date;

  @Prop({ type: Date })
  indexedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(LegalDocument);

// Indexes
DocumentSchema.index({ ownerId: 1 });
DocumentSchema.index({ category: 1 });
DocumentSchema.index({ status: 1 });
DocumentSchema.index({ uploadedAt: -1 });
DocumentSchema.index({ 'metadata.tags': 1 });
DocumentSchema.index({ 'metadata.jurisdiction': 1 });
DocumentSchema.index({ 'metadata.court': 1 });
DocumentSchema.index({ 'metadata.year': 1 });
