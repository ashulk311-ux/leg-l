import { create } from 'zustand';
import { VectorSearchResponse, VectorSearchResult } from '@shared/types';
import { SearchFilters, SearchHistoryItem } from '../services/search';

interface SearchStore {
  // State
  searchResults: VectorSearchResult[];
  isLoading: boolean;
  error: string | null;
  query: string;
  filters: SearchFilters;
  totalResults: number;
  processingTime: number;
  searchHistory: SearchHistoryItem[];
  recentSearches: string[];
  
  // Actions
  setSearchResults: (results: VectorSearchResult[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  setTotalResults: (total: number) => void;
  setProcessingTime: (time: number) => void;
  setSearchHistory: (history: SearchHistoryItem[]) => void;
  setRecentSearches: (searches: string[]) => void;
  
  // Search actions
  addToHistory: (item: SearchHistoryItem) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  addToRecentSearches: (query: string) => void;
  clearRecentSearches: () => void;
  
  // Filter actions
  addFilter: (key: keyof SearchFilters, value: any) => void;
  removeFilter: (key: keyof SearchFilters, value: any) => void;
  clearFilters: () => void;
  
  // Utility actions
  reset: () => void;
  getSearchSuggestions: (query: string) => string[];
  getFilteredResults: (filters: SearchFilters) => VectorSearchResult[];
}

const initialFilters: SearchFilters = {};

export const useSearchStore = create<SearchStore>((set, get) => ({
  // Initial state
  searchResults: [],
  isLoading: false,
  error: null,
  query: '',
  filters: initialFilters,
  totalResults: 0,
  processingTime: 0,
  searchHistory: [],
  recentSearches: [],

  // Actions
  setSearchResults: (results) => set({ searchResults: results }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setQuery: (query) => set({ query }),
  
  setFilters: (filters) => set({ filters }),
  
  setTotalResults: (total) => set({ totalResults: total }),
  
  setProcessingTime: (time) => set({ processingTime: time }),
  
  setSearchHistory: (history) => set({ searchHistory: history }),
  
  setRecentSearches: (searches) => set({ recentSearches: searches }),

  // Search actions
  addToHistory: (item) => set((state) => ({
    searchHistory: [item, ...state.searchHistory.slice(0, 49)], // Keep last 50
  })),

  removeFromHistory: (id) => set((state) => ({
    searchHistory: state.searchHistory.filter(item => item.id !== id),
  })),

  clearHistory: () => set({ searchHistory: [] }),

  addToRecentSearches: (query) => set((state) => {
    const filtered = state.recentSearches.filter(q => q !== query);
    return {
      recentSearches: [query, ...filtered].slice(0, 10), // Keep last 10
    };
  }),

  clearRecentSearches: () => set({ recentSearches: [] }),

  // Filter actions
  addFilter: (key, value) => set((state) => {
    const currentValues = state.filters[key] as any[] || [];
    const newValues = Array.isArray(value) ? value : [value];
    const updatedValues = [...new Set([...currentValues, ...newValues])];
    
    return {
      filters: {
        ...state.filters,
        [key]: updatedValues,
      },
    };
  }),

  removeFilter: (key, value) => set((state) => {
    const currentValues = state.filters[key] as any[] || [];
    const updatedValues = currentValues.filter(v => v !== value);
    
    return {
      filters: {
        ...state.filters,
        [key]: updatedValues.length > 0 ? updatedValues : undefined,
      },
    };
  }),

  clearFilters: () => set({ filters: initialFilters }),

  // Utility actions
  reset: () => set({
    searchResults: [],
    isLoading: false,
    error: null,
    query: '',
    filters: initialFilters,
    totalResults: 0,
    processingTime: 0,
  }),

  getSearchSuggestions: (query) => {
    const { searchHistory, recentSearches } = get();
    
    if (query.length < 2) return [];
    
    const suggestions = [
      ...recentSearches.filter(s => s.toLowerCase().includes(query.toLowerCase())),
      ...searchHistory
        .filter(item => item.query.toLowerCase().includes(query.toLowerCase()))
        .map(item => item.query)
    ];
    
    return [...new Set(suggestions)].slice(0, 5);
  },

  getFilteredResults: (filters) => {
    const { searchResults } = get();
    
    if (!filters || Object.keys(filters).length === 0) {
      return searchResults;
    }
    
    return searchResults.filter(result => {
      // Filter by categories
      if (filters.categories?.length) {
        const hasMatchingCategory = filters.categories.some(category => 
          result.metadata.category === category
        );
        if (!hasMatchingCategory) return false;
      }
      
      // Filter by tags
      if (filters.tags?.length) {
        const hasMatchingTag = filters.tags.some(tag => 
          result.metadata.tags?.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }
      
      // Filter by jurisdictions
      if (filters.jurisdictions?.length) {
        const hasMatchingJurisdiction = filters.jurisdictions.some(jurisdiction => 
          result.metadata.title?.toLowerCase().includes(jurisdiction.toLowerCase())
        );
        if (!hasMatchingJurisdiction) return false;
      }
      
      // Filter by courts
      if (filters.courts?.length) {
        const hasMatchingCourt = filters.courts.some(court => 
          result.metadata.title?.toLowerCase().includes(court.toLowerCase())
        );
        if (!hasMatchingCourt) return false;
      }
      
      // Filter by years
      if (filters.years?.length) {
        const hasMatchingYear = filters.years.some(year => 
          result.metadata.title?.includes(year.toString())
        );
        if (!hasMatchingYear) return false;
      }
      
      // Filter by document IDs
      if (filters.documentIds?.length) {
        if (!filters.documentIds.includes(result.documentId)) return false;
      }
      
      return true;
    });
  },
}));

// Selectors for common use cases
export const useSearchResults = () => useSearchStore((state) => state.searchResults);
export const useSearchLoading = () => useSearchStore((state) => state.isLoading);
export const useSearchError = () => useSearchStore((state) => state.error);
export const useSearchQuery = () => useSearchStore((state) => state.query);
export const useSearchFilters = () => useSearchStore((state) => state.filters);
export const useSearchHistory = () => useSearchStore((state) => state.searchHistory);
export const useRecentSearches = () => useSearchStore((state) => state.recentSearches);
export const useSearchStats = () => useSearchStore((state) => ({
  totalResults: state.totalResults,
  processingTime: state.processingTime,
}));
