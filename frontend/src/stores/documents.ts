import { create } from 'zustand';
import { Document, DocumentStatus, DocumentCategory, CreateDocumentDto } from '@shared/types';
import { DocumentListParams, DocumentFilters, DocumentStats, documentService } from '../services/documents';

interface DocumentStore {
  // State
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filters: DocumentFilters;
  searchQuery: string;
  sortBy: 'title' | 'uploadedAt' | 'processedAt' | 'size';
  sortOrder: 'asc' | 'desc';
  stats: DocumentStats | null;
  
  // Actions
  setDocuments: (documents: Document[]) => void;
  setCurrentDocument: (document: Document | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTotalCount: (count: number) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setFilters: (filters: DocumentFilters) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'title' | 'uploadedAt' | 'processedAt' | 'size') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setStats: (stats: DocumentStats) => void;
  
  // Document actions
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  uploadDocument: (formData: FormData) => Promise<Document>;
  
  // Filter actions
  addFilter: (key: keyof DocumentFilters, value: any) => void;
  removeFilter: (key: keyof DocumentFilters, value: any) => void;
  clearFilters: () => void;
  
  // Utility actions
  reset: () => void;
  getDocumentById: (id: string) => Document | undefined;
  getDocumentsByStatus: (status: DocumentStatus) => Document[];
  getDocumentsByCategory: (category: DocumentCategory) => Document[];
}

const initialFilters: DocumentFilters = {};

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  // Initial state
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  totalPages: 0,
  filters: initialFilters,
  searchQuery: '',
  sortBy: 'uploadedAt',
  sortOrder: 'desc',
  stats: null,

  // Actions
  setDocuments: (documents) => set({ documents }),
  
  setCurrentDocument: (document) => set({ currentDocument: document }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setTotalCount: (count) => set({ totalCount: count }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setTotalPages: (pages) => set({ totalPages: pages }),
  
  setFilters: (filters) => set({ filters }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSortBy: (sortBy) => set({ sortBy }),
  
  setSortOrder: (order) => set({ sortOrder: order }),
  
  setStats: (stats) => set({ stats }),

  // Document actions
  addDocument: (document) => set((state) => ({
    documents: [document, ...state.documents],
    totalCount: state.totalCount + 1,
  })),

  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map(doc => 
      doc._id === id ? { ...doc, ...updates } : doc
    ),
    currentDocument: state.currentDocument?._id === id 
      ? { ...state.currentDocument, ...updates }
      : state.currentDocument,
  })),

  removeDocument: (id) => set((state) => ({
    documents: state.documents.filter(doc => doc._id !== id),
    currentDocument: state.currentDocument?._id === id ? null : state.currentDocument,
    totalCount: Math.max(0, state.totalCount - 1),
  })),

  uploadDocument: async (formData: FormData) => {
    try {
      set({ isLoading: true, error: null });
      
      // Extract file and document data from FormData
      const file = formData.get('file') as File;
      const documentData: CreateDocumentDto = {
        title: formData.get('title') as string,
        description: formData.get('description') as string || '',
        category: formData.get('category') as string,
        jurisdiction: formData.get('jurisdiction') as string || '',
        court: formData.get('court') as string || '',
        year: formData.get('year') ? parseInt(formData.get('year') as string) : undefined,
        caseNumber: formData.get('caseNumber') as string || '',
        tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(tag => tag.trim()) : [],
        isPublic: formData.get('isPublic') === 'true',
      };

      const document = await documentService.uploadDocument(file, documentData);
      
      set((state) => ({
        documents: [document, ...state.documents],
        totalCount: state.totalCount + 1,
        isLoading: false,
      }));

      return document;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

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
    documents: [],
    currentDocument: null,
    isLoading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    filters: initialFilters,
    searchQuery: '',
    sortBy: 'uploadedAt',
    sortOrder: 'desc',
    stats: null,
  }),

  getDocumentById: (id) => {
    const { documents } = get();
    return documents.find(doc => doc._id === id);
  },

  getDocumentsByStatus: (status) => {
    const { documents } = get();
    return documents.filter(doc => doc.status === status);
  },

  getDocumentsByCategory: (category) => {
    const { documents } = get();
    return documents.filter(doc => doc.category === category);
  },
}));

// Selectors for common use cases
export const useDocuments = () => useDocumentStore((state) => state.documents);
export const useCurrentDocument = () => useDocumentStore((state) => state.currentDocument);
export const useDocumentLoading = () => useDocumentStore((state) => state.isLoading);
export const useDocumentError = () => useDocumentStore((state) => state.error);
export const useDocumentFilters = () => useDocumentStore((state) => state.filters);
export const useDocumentStats = () => useDocumentStore((state) => state.stats);
export const useDocumentPagination = () => useDocumentStore((state) => ({
  currentPage: state.currentPage,
  totalPages: state.totalPages,
  totalCount: state.totalCount,
}));
