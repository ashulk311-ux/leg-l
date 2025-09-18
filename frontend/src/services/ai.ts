import { apiService } from './api';
import { 
  LLMRequest, 
  LLMResponse, 
  SummarizationRequest, 
  SummarizationResponse,
  QARequest,
  QAResponse,
  FactMatchingRequest,
  FactMatchingResponse,
  SummaryLength,
  Citation,
  Source
} from '@shared/types';

export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  averageResponseTime: number;
  requestsByType: {
    summarization: number;
    qa: number;
    factMatching: number;
    general: number;
  };
}

export interface AIConfig {
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  enableStreaming: boolean;
}

class AIService {
  private usageStats: AIUsageStats = {
    totalRequests: 0,
    totalTokens: 0,
    averageResponseTime: 0,
    requestsByType: {
      summarization: 0,
      qa: 0,
      factMatching: 0,
      general: 0,
    },
  };

  public async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    
    try {
      const response = await apiService.post<LLMResponse>('/llm/generate', request);
      
      this.updateUsageStats('general', response.usage?.totalTokens || 0, Date.now() - startTime);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async summarizeDocument(request: SummarizationRequest): Promise<SummarizationResponse> {
    const startTime = Date.now();
    
    try {
      const response = await apiService.post<SummarizationResponse>('/llm/summarize', request);
      
      this.updateUsageStats('summarization', 0, Date.now() - startTime);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async answerQuestion(request: QARequest): Promise<QAResponse> {
    const startTime = Date.now();
    
    try {
      const response = await apiService.post<QAResponse>('/llm/qa', request);
      
      this.updateUsageStats('qa', 0, Date.now() - startTime);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async matchFacts(request: FactMatchingRequest): Promise<FactMatchingResponse> {
    const startTime = Date.now();
    
    try {
      const response = await apiService.post<FactMatchingResponse>('/llm/match-facts', request);
      
      this.updateUsageStats('factMatching', 0, Date.now() - startTime);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Convenience methods for common use cases
  public async summarizeDocumentById(
    documentId: string, 
    length: SummaryLength = SummaryLength.MEDIUM,
    includeCitations: boolean = true
  ): Promise<SummarizationResponse> {
    return this.summarizeDocument({
      documentId,
      length,
      includeCitations,
    });
  }

  public async askQuestion(
    question: string, 
    documentIds?: string[], 
    includeSources: boolean = true
  ): Promise<QAResponse> {
    return this.answerQuestion({
      question,
      documentIds,
      includeSources,
    });
  }

  public async matchFactsInDocuments(
    facts: string[], 
    documentIds?: string[]
  ): Promise<FactMatchingResponse> {
    return this.matchFacts({
      facts,
      documentIds,
    });
  }

  public async generateDocumentSummary(
    documentId: string,
    customPrompt?: string
  ): Promise<SummarizationResponse> {
    const request: SummarizationRequest = {
      documentId,
      length: SummaryLength.MEDIUM,
      includeCitations: true,
    };

    if (customPrompt) {
      // For custom prompts, we'll use the general LLM endpoint
      const llmRequest: LLMRequest = {
        prompt: customPrompt,
        model: 'gpt-4',
        provider: 'openai',
        maxTokens: 2000,
        temperature: 0.1,
      };

      const response = await this.generateResponse(llmRequest);
      
      return {
        summary: response.content,
        length: SummaryLength.MEDIUM,
        citations: [],
        processingTime: response.processingTime,
        model: response.model,
        confidence: 0.8,
      };
    }

    return this.summarizeDocument(request);
  }

  public async generateRelatedQuestions(question: string): Promise<string[]> {
    const prompt = `Based on this legal question: "${question}", generate 3 related questions that a legal professional might ask. Return only the questions, one per line.`;
    
    const request: LLMRequest = {
      prompt,
      model: 'gpt-4',
      provider: 'openai',
      maxTokens: 200,
      temperature: 0.7,
    };

    const response = await this.generateResponse(request);
    
    return response.content
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .slice(0, 3);
  }

  public async extractKeyPoints(documentId: string): Promise<string[]> {
    const prompt = `Extract the 5 most important key points from this legal document. Return only the key points, one per line, without numbering.`;
    
    const request: LLMRequest = {
      prompt,
      model: 'gpt-4',
      provider: 'openai',
      maxTokens: 500,
      temperature: 0.1,
    };

    const response = await this.generateResponse(request);
    
    return response.content
      .split('\n')
      .map(point => point.trim())
      .filter(point => point.length > 0)
      .slice(0, 5);
  }

  public async generateDocumentTags(documentId: string): Promise<string[]> {
    const prompt = `Generate 5 relevant tags for this legal document. Return only the tags, separated by commas.`;
    
    const request: LLMRequest = {
      prompt,
      model: 'gpt-4',
      provider: 'openai',
      maxTokens: 100,
      temperature: 0.3,
    };

    const response = await this.generateResponse(request);
    
    return response.content
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 5);
  }

  // Utility methods
  public getUsageStats(): AIUsageStats {
    return { ...this.usageStats };
  }

  public resetUsageStats(): void {
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      averageResponseTime: 0,
      requestsByType: {
        summarization: 0,
        qa: 0,
        factMatching: 0,
        general: 0,
      },
    };
  }

  private updateUsageStats(type: keyof AIUsageStats['requestsByType'], tokens: number, responseTime: number): void {
    this.usageStats.totalRequests++;
    this.usageStats.totalTokens += tokens;
    this.usageStats.requestsByType[type]++;
    
    // Update average response time
    const totalTime = this.usageStats.averageResponseTime * (this.usageStats.totalRequests - 1) + responseTime;
    this.usageStats.averageResponseTime = totalTime / this.usageStats.totalRequests;
  }

  public formatCitations(citations: Citation[]): string {
    if (citations.length === 0) return '';
    
    return citations
      .map((citation, index) => `[${index + 1}] ${citation.text}`)
      .join('\n');
  }

  public formatSources(sources: Source[]): string {
    if (sources.length === 0) return '';
    
    return sources
      .map((source, index) => `${index + 1}. ${source.title} (Page ${source.pageNumbers.join(', ')})`)
      .join('\n');
  }

  public getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (confidence >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  }

  public getConfidenceLabel(confidence: number): string {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    if (confidence >= 0.4) return 'Low Confidence';
    return 'Very Low Confidence';
  }

  public formatProcessingTime(time: number): string {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  }

  public validateQuestion(question: string): { isValid: boolean; error?: string } {
    if (!question.trim()) {
      return { isValid: false, error: 'Question cannot be empty' };
    }
    
    if (question.length < 10) {
      return { isValid: false, error: 'Question must be at least 10 characters long' };
    }
    
    if (question.length > 500) {
      return { isValid: false, error: 'Question must be less than 500 characters' };
    }
    
    return { isValid: true };
  }

  public validateFacts(facts: string[]): { isValid: boolean; error?: string } {
    if (facts.length === 0) {
      return { isValid: false, error: 'At least one fact is required' };
    }
    
    if (facts.length > 10) {
      return { isValid: false, error: 'Maximum 10 facts allowed' };
    }
    
    for (const fact of facts) {
      if (!fact.trim()) {
        return { isValid: false, error: 'Facts cannot be empty' };
      }
      
      if (fact.length < 10) {
        return { isValid: false, error: 'Each fact must be at least 10 characters long' };
      }
    }
    
    return { isValid: true };
  }
}

// Create singleton instance
export const aiService = new AIService();

// Export types
export type { AIUsageStats, AIConfig };
