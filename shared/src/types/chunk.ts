import { z } from 'zod';

// Chunk Schema
export const ChunkSchema = z.object({
  _id: z.string().optional(),
  documentId: z.string(),
  chunkText: z.string(),
  startPos: z.number().nonnegative(),
  endPos: z.number().nonnegative(),
  pageNumbers: z.array(z.number().positive()).default([]),
  tokenCount: z.number().positive(),
  embeddingId: z.string().optional(),
  vectorId: z.string().optional(),
  metadata: z.object({
    chunkIndex: z.number().nonnegative(),
    isHeader: z.boolean().default(false),
    isFooter: z.boolean().default(false),
    isTable: z.boolean().default(false),
    isList: z.boolean().default(false),
    confidence: z.number().min(0).max(1).optional(),
    language: z.string().optional(),
    entities: z.array(z.object({
      text: z.string(),
      type: z.string(),
      start: z.number(),
      end: z.number()
    })).default([])
  }).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// Chunk Types
export type Chunk = z.infer<typeof ChunkSchema>;
export type CreateChunkDto = Omit<Chunk, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateChunkDto = Partial<Omit<Chunk, '_id' | 'createdAt' | 'documentId'>>;
export type ChunkMetadata = Chunk['metadata'];

// Chunk Processing Types
export interface ChunkProcessingJob {
  documentId: string;
  chunks: CreateChunkDto[];
  embeddingModel: string;
  vectorStore: string;
}

export interface ChunkProcessingResult {
  success: boolean;
  processedChunks: number;
  failedChunks: number;
  errors: string[];
  processingTime: number;
}

// Vector Search Types
export interface VectorSearchDto {
  query: string;
  documentIds?: string[];
  topK?: number;
  scoreThreshold?: number;
  filters?: {
    categories?: string[];
    tags?: string[];
    jurisdictions?: string[];
    courts?: string[];
    years?: number[];
  };
}

export interface VectorSearchResult {
  chunkId: string;
  documentId: string;
  score: number;
  chunkText: string;
  metadata: {
    title: string;
    pageNumbers: number[];
    category: string;
    tags: string[];
  };
}

export interface VectorSearchResponse {
  results: VectorSearchResult[];
  total: number;
  query: string;
  processingTime: number;
}

// Embedding Types
export interface EmbeddingRequest {
  text: string;
  model: string;
  chunkId?: string;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  tokenCount: number;
  chunkId?: string;
}

// Chunking Configuration
export interface ChunkingConfig {
  maxChunkSize: number;
  overlapSize: number;
  strategy: 'sliding_window' | 'sentence_boundary' | 'paragraph_boundary';
  preserveFormatting: boolean;
  removeHeaders: boolean;
  removeFooters: boolean;
  minChunkSize: number;
}

// Default Chunking Configuration
export const DEFAULT_CHUNKING_CONFIG: ChunkingConfig = {
  maxChunkSize: 1000,
  overlapSize: 100,
  strategy: 'sliding_window',
  preserveFormatting: true,
  removeHeaders: true,
  removeFooters: true,
  minChunkSize: 50
};
