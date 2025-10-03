import { z } from 'zod';

// Document Category Enum
export enum DocumentCategory {
  STATUTE = 'statute',
  JUDGEMENT = 'judgement',
  CIRCULAR = 'circular',
  NOTIFICATION = 'notification',
  CONTRACT = 'contract',
  POLICY = 'policy',
  OTHER = 'other'
}

// Document Status Enum
export enum DocumentStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  INDEXED = 'indexed',
  ERROR = 'error',
  DELETED = 'deleted'
}

// Document Type Enum
export enum DocumentType {
  PDF = 'pdf',
  DOCX = 'docx',
  TXT = 'txt',
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  TIFF = 'tiff'
}

// Document Schema
export const DocumentSchema = z.object({
  _id: z.string().optional(),
  ownerId: z.string(),
  title: z.string().min(1).max(200),
  filename: z.string(),
  originalFilename: z.string(),
  s3Key: z.string(),
  s3Bucket: z.string(),
  category: z.nativeEnum(DocumentCategory),
  type: z.nativeEnum(DocumentType),
  status: z.nativeEnum(DocumentStatus).default(DocumentStatus.UPLOADED),
  metadata: z.object({
    size: z.number().positive(),
    mimeType: z.string(),
    pages: z.number().optional(),
    language: z.string().optional(),
    jurisdiction: z.string().optional(),
    court: z.string().optional(),
    year: z.number().optional(),
    caseNumber: z.string().optional(),
    tags: z.array(z.string()).default([]),
    extractedText: z.string().optional(),
    ocrUsed: z.boolean().default(false),
    processingTime: z.number().optional(),
    errorMessage: z.string().optional()
  }),
  permissions: z.object({
    isPublic: z.boolean().default(false),
    allowedUsers: z.array(z.string()).default([]),
    allowedRoles: z.array(z.string()).default([])
  }).optional(),
  uploadedAt: z.date().default(() => new Date()),
  processedAt: z.date().optional(),
  indexedAt: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// Document Types
export type Document = z.infer<typeof DocumentSchema>;
export type CreateDocumentDto = Omit<Document, '_id' | 'createdAt' | 'updatedAt' | 'uploadedAt' | 'processedAt' | 'indexedAt' | 'metadata' | 'permissions'> & {
  // Flatten metadata properties to top level for easier API usage
  jurisdiction?: string;
  court?: string;
  year?: number;
  caseNumber?: string;
  tags?: string[];
  // Flatten permissions properties to top level
  isPublic?: boolean;
  allowedUsers?: string[];
  allowedRoles?: string[];
};
export type UpdateDocumentDto = Partial<Omit<Document, '_id' | 'createdAt' | 'uploadedAt'>>;
export type DocumentMetadata = Document['metadata'];
export type DocumentPermissions = Document['permissions'];

// Document Upload Types
export interface DocumentUploadDto {
  title: string;
  category: DocumentCategory;
  tags?: string[];
  jurisdiction?: string;
  court?: string;
  year?: number;
  caseNumber?: string;
  isPublic?: boolean;
  allowedUsers?: string[];
  allowedRoles?: string[];
}

export interface DocumentUploadResponse {
  documentId: string;
  uploadUrl?: string;
  status: DocumentStatus;
}

// Document Search Types
export interface DocumentSearchDto {
  query?: string;
  category?: DocumentCategory;
  tags?: string[];
  jurisdiction?: string;
  court?: string;
  year?: number;
  ownerId?: string;
  status?: DocumentStatus;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'uploadedAt' | 'processedAt' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export interface DocumentSearchResponse {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Document Filter Types
export interface DocumentFilters {
  categories?: DocumentCategory[];
  tags?: string[];
  jurisdictions?: string[];
  courts?: string[];
  years?: number[];
  statuses?: DocumentStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
}
