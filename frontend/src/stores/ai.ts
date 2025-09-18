import { create } from 'zustand';
import { 
  SummarizationResponse, 
  QAResponse, 
  FactMatchingResponse,
  SummaryLength 
} from '@shared/types';
import { AIUsageStats } from '../services/ai';

interface AIStore {
  // State
  currentSummary: SummarizationResponse | null;
  currentQA: QAResponse | null;
  currentFactMatching: FactMatchingResponse | null;
  isLoading: boolean;
  error: string | null;
  usageStats: AIUsageStats;
  
  // History
  summaryHistory: SummarizationResponse[];
  qaHistory: QAResponse[];
  factMatchingHistory: FactMatchingResponse[];
  
  // Actions
  setCurrentSummary: (summary: SummarizationResponse | null) => void;
  setCurrentQA: (qa: QAResponse | null) => void;
  setCurrentFactMatching: (factMatching: FactMatchingResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUsageStats: (stats: AIUsageStats) => void;
  
  // History actions
  addToSummaryHistory: (summary: SummarizationResponse) => void;
  addToQAHistory: (qa: QAResponse) => void;
  addToFactMatchingHistory: (factMatching: FactMatchingResponse) => void;
  clearSummaryHistory: () => void;
  clearQAHistory: () => void;
  clearFactMatchingHistory: () => void;
  clearAllHistory: () => void;
  
  // Utility actions
  reset: () => void;
  getRecentSummaries: (limit?: number) => SummarizationResponse[];
  getRecentQAs: (limit?: number) => QAResponse[];
  getRecentFactMatchings: (limit?: number) => FactMatchingResponse[];
}

const initialUsageStats: AIUsageStats = {
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

export const useAIStore = create<AIStore>((set, get) => ({
  // Initial state
  currentSummary: null,
  currentQA: null,
  currentFactMatching: null,
  isLoading: false,
  error: null,
  usageStats: initialUsageStats,
  summaryHistory: [],
  qaHistory: [],
  factMatchingHistory: [],

  // Actions
  setCurrentSummary: (summary) => set({ currentSummary: summary }),
  
  setCurrentQA: (qa) => set({ currentQA: qa }),
  
  setCurrentFactMatching: (factMatching) => set({ currentFactMatching: factMatching }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setUsageStats: (stats) => set({ usageStats: stats }),

  // History actions
  addToSummaryHistory: (summary) => set((state) => ({
    summaryHistory: [summary, ...state.summaryHistory.slice(0, 49)], // Keep last 50
  })),

  addToQAHistory: (qa) => set((state) => ({
    qaHistory: [qa, ...state.qaHistory.slice(0, 49)], // Keep last 50
  })),

  addToFactMatchingHistory: (factMatching) => set((state) => ({
    factMatchingHistory: [factMatching, ...state.factMatchingHistory.slice(0, 49)], // Keep last 50
  })),

  clearSummaryHistory: () => set({ summaryHistory: [] }),
  
  clearQAHistory: () => set({ qaHistory: [] }),
  
  clearFactMatchingHistory: () => set({ factMatchingHistory: [] }),
  
  clearAllHistory: () => set({
    summaryHistory: [],
    qaHistory: [],
    factMatchingHistory: [],
  }),

  // Utility actions
  reset: () => set({
    currentSummary: null,
    currentQA: null,
    currentFactMatching: null,
    isLoading: false,
    error: null,
  }),

  getRecentSummaries: (limit = 10) => {
    const { summaryHistory } = get();
    return summaryHistory.slice(0, limit);
  },

  getRecentQAs: (limit = 10) => {
    const { qaHistory } = get();
    return qaHistory.slice(0, limit);
  },

  getRecentFactMatchings: (limit = 10) => {
    const { factMatchingHistory } = get();
    return factMatchingHistory.slice(0, limit);
  },
}));

// Selectors for common use cases
export const useCurrentSummary = () => useAIStore((state) => state.currentSummary);
export const useCurrentQA = () => useAIStore((state) => state.currentQA);
export const useCurrentFactMatching = () => useAIStore((state) => state.currentFactMatching);
export const useAILoading = () => useAIStore((state) => state.isLoading);
export const useAIError = () => useAIStore((state) => state.error);
export const useAIUsageStats = () => useAIStore((state) => state.usageStats);
export const useSummaryHistory = () => useAIStore((state) => state.summaryHistory);
export const useQAHistory = () => useAIStore((state) => state.qaHistory);
export const useFactMatchingHistory = () => useAIStore((state) => state.factMatchingHistory);
