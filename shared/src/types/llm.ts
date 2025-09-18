import { z } from 'zod';

// LLM Provider Enum
export enum LLMProvider {
  OPENAI = 'openai',
  AZURE_OPENAI = 'azure_openai',
  ANTHROPIC = 'anthropic',
  LOCAL = 'local',
  SELF_HOSTED = 'self_hosted'
}

// LLM Model Enum
export enum LLMModel {
  GPT_4 = 'gpt-4',
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  CLAUDE_3_OPUS = 'claude-3-opus',
  CLAUDE_3_SONNET = 'claude-3-sonnet',
  CLAUDE_3_HAIKU = 'claude-3-haiku',
  LLAMA_2 = 'llama-2',
  MISTRAL = 'mistral'
}

// Summary Length Enum
export enum SummaryLength {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long'
}

// LLM Request Schema
export const LLMRequestSchema = z.object({
  prompt: z.string().min(1),
  model: z.nativeEnum(LLMModel),
  provider: z.nativeEnum(LLMProvider),
  maxTokens: z.number().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  stop: z.array(z.string()).optional(),
  context: z.array(z.object({
    text: z.string(),
    source: z.string(),
    pageNumbers: z.array(z.number()).optional()
  })).optional()
});

// LLM Response Schema
export const LLMResponseSchema = z.object({
  content: z.string(),
  model: z.nativeEnum(LLMModel),
  provider: z.nativeEnum(LLMProvider),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number()
  }),
  finishReason: z.string(),
  processingTime: z.number(),
  citations: z.array(z.object({
    text: z.string(),
    source: z.string(),
    pageNumbers: z.array(z.number()).optional(),
    confidence: z.number().min(0).max(1).optional()
  })).optional()
});

// LLM Types
export type LLMRequest = z.infer<typeof LLMRequestSchema>;
export type LLMResponse = z.infer<typeof LLMResponseSchema>;

// Summarization Types
export interface SummarizationRequest {
  documentId: string;
  length: SummaryLength;
  includeCitations: boolean;
  customPrompt?: string;
  focusAreas?: string[];
}

export interface SummarizationResponse {
  summary: string;
  length: SummaryLength;
  citations: Citation[];
  processingTime: number;
  model: LLMModel;
  confidence: number;
}

// Question Answering Types
export interface QARequest {
  question: string;
  documentIds?: string[];
  context?: string[];
  maxContextLength?: number;
  includeSources: boolean;
}

export interface QAResponse {
  answer: string;
  sources: Source[];
  confidence: number;
  processingTime: number;
  model: LLMModel;
  relatedQuestions?: string[];
}

// Citation and Source Types
export interface Citation {
  text: string;
  source: string;
  pageNumbers: number[];
  confidence: number;
  relevance: number;
}

export interface Source {
  documentId: string;
  title: string;
  chunkId: string;
  text: string;
  pageNumbers: number[];
  score: number;
}

// Fact Matching Types
export interface FactMatchingRequest {
  facts: string[];
  documentIds?: string[];
  threshold?: number;
  maxResults?: number;
}

export interface FactMatchingResponse {
  matches: FactMatch[];
  totalMatches: number;
  processingTime: number;
}

export interface FactMatch {
  fact: string;
  documentId: string;
  title: string;
  relevantChunks: {
    chunkId: string;
    text: string;
    pageNumbers: number[];
    score: number;
  }[];
  overallScore: number;
}

// LLM Configuration
export interface LLMConfig {
  provider: LLMProvider;
  model: LLMModel;
  apiKey?: string;
  endpoint?: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  timeout: number;
  retryAttempts: number;
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

// Prompt Templates
export interface PromptTemplate {
  name: string;
  template: string;
  variables: string[];
  description: string;
  category: 'summarization' | 'qa' | 'fact_matching' | 'analysis';
}

// Default Prompt Templates
export const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    name: 'legal_summary',
    template: `You are a legal expert. Please provide a comprehensive summary of the following legal document.

Document: {documentTitle}
Category: {category}

Content:
{content}

Please provide a {length} summary that includes:
1. Key legal points and arguments
2. Important facts and evidence
3. Legal precedents or references
4. Conclusions or outcomes
5. Relevant citations with page numbers

Summary:`,
    variables: ['documentTitle', 'category', 'content', 'length'],
    description: 'Legal document summarization template',
    category: 'summarization'
  },
  {
    name: 'legal_qa',
    template: `You are a legal expert. Answer the following question based on the provided legal documents.

Question: {question}

Relevant Documents:
{context}

Please provide a comprehensive answer that:
1. Directly addresses the question
2. Cites specific sources and page numbers
3. Explains the legal reasoning
4. Notes any limitations or uncertainties

Answer:`,
    variables: ['question', 'context'],
    description: 'Legal question answering template',
    category: 'qa'
  }
];
