import { apiService } from './api';
import { 
  VectorSearchDto, 
  VectorSearchResponse, 
  VectorSearchResult 
} from '@shared/types';

export interface SearchFilters {
  categories?: string[];
  tags?: string[];
  jurisdictions?: string[];
  courts?: string[];
  years?: number[];
  documentIds?: string[];
}

export interface SearchParams {
  query: string;
  topK?: number;
  scoreThreshold?: number;
  filters?: SearchFilters;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
  filters?: SearchFilters;
}

export interface SearchStats {
  totalSearches: number;
  averageResults: number;
  popularQueries: Array<{ query: string; count: number }>;
  searchPerformance: {
    averageResponseTime: number;
    totalSearches: number;
  };
}

class SearchService {
  private searchHistory: SearchHistoryItem[] = [];

  public async similaritySearch(params: SearchParams): Promise<VectorSearchResponse> {
    const searchDto: VectorSearchDto = {
      query: params.query,
      topK: params.topK || 10,
      scoreThreshold: params.scoreThreshold || 0.7,
      filters: params.filters,
    };

    const startTime = Date.now();
    const response = await apiService.post<VectorSearchResponse>('/search/similarity', searchDto);
    const responseTime = Date.now() - startTime;

    // Add to search history
    this.addToHistory({
      id: Date.now().toString(),
      query: params.query,
      timestamp: new Date(),
      resultCount: response.results.length,
      filters: params.filters,
    });

    return {
      ...response,
      processingTime: responseTime,
    };
  }

  public async getVectorStoreStats(): Promise<any> {
    return apiService.get('/search/stats');
  }

  public async searchDocuments(query: string, filters?: SearchFilters): Promise<VectorSearchResponse> {
    return this.similaritySearch({
      query,
      filters,
      topK: 20,
      scoreThreshold: 0.6,
    });
  }

  public async searchByCategory(category: string, query?: string): Promise<VectorSearchResponse> {
    return this.similaritySearch({
      query: query || '',
      filters: { categories: [category] },
      topK: 15,
    });
  }

  public async searchByTags(tags: string[], query?: string): Promise<VectorSearchResponse> {
    return this.similaritySearch({
      query: query || '',
      filters: { tags },
      topK: 15,
    });
  }

  public async searchByJurisdiction(jurisdiction: string, query?: string): Promise<VectorSearchResponse> {
    return this.similaritySearch({
      query: query || '',
      filters: { jurisdictions: [jurisdiction] },
      topK: 15,
    });
  }

  public async searchByCourt(court: string, query?: string): Promise<VectorSearchResponse> {
    return this.similaritySearch({
      query: query || '',
      filters: { courts: [court] },
      topK: 15,
    });
  }

  public async searchByYear(year: number, query?: string): Promise<VectorSearchResponse> {
    return this.similaritySearch({
      query: query || '',
      filters: { years: [year] },
      topK: 15,
    });
  }

  public async searchInDocuments(documentIds: string[], query: string): Promise<VectorSearchResponse> {
    return this.similaritySearch({
      query,
      filters: { documentIds },
      topK: 10,
      scoreThreshold: 0.8,
    });
  }

  // Search history management
  public getSearchHistory(): SearchHistoryItem[] {
    return [...this.searchHistory];
  }

  public clearSearchHistory(): void {
    this.searchHistory = [];
  }

  public removeFromHistory(id: string): void {
    this.searchHistory = this.searchHistory.filter(item => item.id !== id);
  }

  private addToHistory(item: SearchHistoryItem): void {
    this.searchHistory.unshift(item);
    
    // Keep only last 50 searches
    if (this.searchHistory.length > 50) {
      this.searchHistory = this.searchHistory.slice(0, 50);
    }
  }

  // Utility methods
  public highlightSearchTerms(text: string, query: string): string {
    if (!query.trim()) return text;
    
    const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    let highlightedText = text;
    
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  }

  public extractKeywords(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2)
      .filter(term => !this.isStopWord(term));
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ];
    return stopWords.includes(word);
  }

  public getSearchSuggestions(query: string): string[] {
    if (query.length < 2) return [];
    
    const history = this.getSearchHistory();
    const suggestions = history
      .filter(item => 
        item.query.toLowerCase().includes(query.toLowerCase()) && 
        item.query !== query
      )
      .map(item => item.query)
      .slice(0, 5);
    
    return [...new Set(suggestions)];
  }

  public formatSearchResult(result: VectorSearchResult): {
    title: string;
    snippet: string;
    score: number;
    metadata: any;
  } {
    return {
      title: result.metadata.title || 'Untitled Document',
      snippet: this.truncateText(result.chunkText, 200),
      score: Math.round(result.score * 100) / 100,
      metadata: result.metadata,
    };
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  }

  public getScoreColor(score: number): string {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (score >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  }

  public getScoreLabel(score: number): string {
    if (score >= 0.8) return 'Very High';
    if (score >= 0.6) return 'High';
    if (score >= 0.4) return 'Medium';
    if (score >= 0.2) return 'Low';
    return 'Very Low';
  }
}

// Create singleton instance
export const searchService = new SearchService();

// Export types
export type { SearchFilters, SearchParams, SearchHistoryItem, SearchStats };
