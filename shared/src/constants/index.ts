// Application Constants
export const APP_NAME = 'Legal Document Management System';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI-powered legal document management with RAG capabilities';

// API Constants
export const API_PREFIX = '/api';
export const API_VERSION = 'v1';
export const API_BASE_URL = `${API_PREFIX}/${API_VERSION}`;

// File Upload Constants
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/tiff'
];

export const ALLOWED_FILE_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.doc',
  '.txt',
  '.jpg',
  '.jpeg',
  '.png',
  '.tiff'
];

// Pagination Constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE = 1;

// Search Constants
export const DEFAULT_SEARCH_LIMIT = 10;
export const MAX_SEARCH_LIMIT = 50;
export const DEFAULT_SIMILARITY_THRESHOLD = 0.7;

// Chunking Constants
export const DEFAULT_CHUNK_SIZE = 1000;
export const DEFAULT_CHUNK_OVERLAP = 100;
export const MIN_CHUNK_SIZE = 50;
export const MAX_CHUNK_SIZE = 2000;

// LLM Constants
export const DEFAULT_MAX_TOKENS = 4000;
export const DEFAULT_TEMPERATURE = 0.1;
export const DEFAULT_TOP_P = 0.9;
export const DEFAULT_FREQUENCY_PENALTY = 0;
export const DEFAULT_PRESENCE_PENALTY = 0;

// Rate Limiting Constants
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS = false;

// Security Constants
export const BCRYPT_ROUNDS = 12;
export const JWT_EXPIRES_IN = '24h';
export const JWT_REFRESH_EXPIRES_IN = '7d';
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

// Cache Constants
export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 60 * 60, // 1 hour
  VERY_LONG: 24 * 60 * 60 // 24 hours
};

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  LLM_ERROR: 'LLM_ERROR',
  VECTOR_SEARCH_ERROR: 'VECTOR_SEARCH_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

// Database Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  DOCUMENTS: 'documents',
  CHUNKS: 'chunks',
  CHUNKS_VECTORS: 'chunks_vectors',
  JOBS: 'jobs',
  AUDIT_LOGS: 'audit_logs',
  CONFIGURATIONS: 'configurations'
} as const;

// Queue Names
export const QUEUES = {
  DOCUMENT_PROCESSING: 'document-processing',
  EMBEDDING_GENERATION: 'embedding-generation',
  VECTOR_INDEXING: 'vector-indexing',
  LLM_PROCESSING: 'llm-processing',
  EMAIL_NOTIFICATIONS: 'email-notifications'
} as const;

// Job Types
export const JOB_TYPES = {
  DOCUMENT_UPLOAD: 'document-upload',
  TEXT_EXTRACTION: 'text-extraction',
  DOCUMENT_CHUNKING: 'document-chunking',
  EMBEDDING_GENERATION: 'embedding-generation',
  VECTOR_INDEXING: 'vector-indexing',
  DOCUMENT_SUMMARIZATION: 'document-summarization',
  QUESTION_ANSWERING: 'question-answering',
  FACT_MATCHING: 'fact-matching'
} as const;

// Vector Store Types
export const VECTOR_STORE_TYPES = {
  FAISS: 'faiss',
  MILVUS: 'milvus',
  WEAVIATE: 'weaviate',
  PINECONE: 'pinecone',
  MONGODB: 'mongodb'
} as const;

// LLM Providers
export const LLM_PROVIDERS = {
  OPENAI: 'openai',
  AZURE_OPENAI: 'azure_openai',
  ANTHROPIC: 'anthropic',
  LOCAL: 'local',
  SELF_HOSTED: 'self_hosted'
} as const;

// Embedding Models
export const EMBEDDING_MODELS = {
  OPENAI_ADA_002: 'text-embedding-ada-002',
  OPENAI_3_SMALL: 'text-embedding-3-small',
  OPENAI_3_LARGE: 'text-embedding-3-large',
  SENTENCE_TRANSFORMERS_ALL_MPNET: 'sentence-transformers/all-mpnet-base-v2',
  SENTENCE_TRANSFORMERS_ALL_MINILM: 'sentence-transformers/all-MiniLM-L6-v2'
} as const;

// OCR Languages
export const OCR_LANGUAGES = {
  ENGLISH: 'eng',
  SPANISH: 'spa',
  FRENCH: 'fra',
  GERMAN: 'deu',
  ITALIAN: 'ita',
  PORTUGUESE: 'por',
  RUSSIAN: 'rus',
  CHINESE: 'chi_sim',
  JAPANESE: 'jpn',
  KOREAN: 'kor',
  ARABIC: 'ara',
  HINDI: 'hin'
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  DOCUMENT_PROCESSED: 'document_processed',
  DOCUMENT_ERROR: 'document_error',
  PROCESSING_COMPLETE: 'processing_complete',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SECURITY_ALERT: 'security_alert'
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_OCR: 'enable_ocr',
  ENABLE_VECTOR_SEARCH: 'enable_vector_search',
  ENABLE_LLM_SUMMARIZATION: 'enable_llm_summarization',
  ENABLE_AUDIT_LOGGING: 'enable_audit_logging',
  ENABLE_EMAIL_NOTIFICATIONS: 'enable_email_notifications',
  ENABLE_PUSH_NOTIFICATIONS: 'enable_push_notifications',
  ENABLE_MOBILE_APP: 'enable_mobile_app',
  ENABLE_API_RATE_LIMITING: 'enable_api_rate_limiting'
} as const;
