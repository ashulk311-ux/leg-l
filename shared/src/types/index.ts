// Export all types from a single entry point
export * from './user';
export * from './document';
export * from './chunk';
export * from './llm';

// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
  method?: string;
}

// Job Status Types
export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface Job {
  id: string;
  type: string;
  status: JobStatus;
  progress: number;
  data: any;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// Audit Log Types
export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  SEARCH = 'search',
  SUMMARIZE = 'summarize',
  QA = 'qa'
}

export interface AuditLog {
  _id?: string;
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Configuration Types
export interface AppConfig {
  database: {
    mongodb: {
      uri: string;
      options: any;
    };
    redis: {
      url: string;
      options: any;
    };
  };
  storage: {
    type: 's3' | 'minio';
    config: any;
  };
  vectorStore: {
    type: 'faiss' | 'milvus' | 'weaviate' | 'pinecone';
    config: any;
  };
  llm: {
    provider: string;
    config: any;
  };
  security: {
    jwt: {
      secret: string;
      expiresIn: string;
      refreshSecret: string;
      refreshExpiresIn: string;
    };
    bcrypt: {
      rounds: number;
    };
    rateLimit: {
      windowMs: number;
      maxRequests: number;
    };
  };
  features: {
    enableOCR: boolean;
    enableVectorSearch: boolean;
    enableLLMSummarization: boolean;
    enableAuditLogging: boolean;
  };
}
