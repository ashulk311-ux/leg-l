import { apiService } from './api';
import { 
  Document, 
  CreateDocumentDto, 
  UpdateDocumentDto, 
  DocumentSearchDto, 
  DocumentSearchResponse,
  DocumentStatus,
  DocumentCategory 
} from '@shared/types';

export interface DocumentUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface DocumentFilters {
  status?: DocumentStatus[];
  categories?: DocumentCategory[];
  tags?: string[];
  jurisdictions?: string[];
  courts?: string[];
  years?: number[];
  isPublic?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface DocumentListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'title' | 'uploadedAt' | 'processedAt' | 'size';
  sortOrder?: 'asc' | 'desc';
  filters?: DocumentFilters;
}

export interface DocumentStats {
  total: number;
  byStatus: Record<DocumentStatus, number>;
  byCategory: Record<DocumentCategory, number>;
  totalSize: number;
  averageProcessingTime: number;
}

class DocumentService {
  public async uploadDocument(
    file: File,
    documentData: CreateDocumentDto,
    onProgress?: (progress: DocumentUploadProgress) => void
  ): Promise<Document> {
    const progressCallback = onProgress 
      ? (progress: number) => {
          onProgress({
            loaded: progress,
            total: 100,
            percentage: progress,
          });
        }
      : undefined;

    return apiService.uploadFile<Document>(
      '/documents',
      file,
      documentData,
      progressCallback
    );
  }

  public async uploadJudgement(
    file: File,
    documentData: CreateDocumentDto,
    onProgress?: (progress: DocumentUploadProgress) => void
  ): Promise<Document> {
    const progressCallback = onProgress 
      ? (progress: number) => {
          onProgress({
            loaded: progress,
            total: 100,
            percentage: progress,
          });
        }
      : undefined;

    return apiService.uploadFile<Document>(
      '/documents/judgement',
      file,
      documentData,
      progressCallback
    );
  }

  public async uploadCircular(
    file: File,
    documentData: CreateDocumentDto,
    onProgress?: (progress: DocumentUploadProgress) => void
  ): Promise<Document> {
    const progressCallback = onProgress 
      ? (progress: number) => {
          onProgress({
            loaded: progress,
            total: 100,
            percentage: progress,
          });
        }
      : undefined;

    return apiService.uploadFile<Document>(
      '/documents/circular',
      file,
      documentData,
      progressCallback
    );
  }

  public async uploadNotification(
    file: File,
    documentData: CreateDocumentDto,
    onProgress?: (progress: DocumentUploadProgress) => void
  ): Promise<Document> {
    const progressCallback = onProgress 
      ? (progress: number) => {
          onProgress({
            loaded: progress,
            total: 100,
            percentage: progress,
          });
        }
      : undefined;

    return apiService.uploadFile<Document>(
      '/documents/notification',
      file,
      documentData,
      progressCallback
    );
  }

  public async uploadStatute(
    file: File,
    documentData: CreateDocumentDto,
    onProgress?: (progress: DocumentUploadProgress) => void
  ): Promise<Document> {
    const progressCallback = onProgress 
      ? (progress: number) => {
          onProgress({
            loaded: progress,
            total: 100,
            percentage: progress,
          });
        }
      : undefined;

    return apiService.uploadFile<Document>(
      '/documents/statute',
      file,
      documentData,
      progressCallback
    );
  }

  public async getDocuments(params: DocumentListParams = {}): Promise<DocumentSearchResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    if (params.filters) {
      if (params.filters.status?.length) {
        params.filters.status.forEach(status => queryParams.append('status', status));
      }
      if (params.filters.categories?.length) {
        params.filters.categories.forEach(category => queryParams.append('category', category));
      }
      if (params.filters.tags?.length) {
        params.filters.tags.forEach(tag => queryParams.append('tags', tag));
      }
      if (params.filters.jurisdictions?.length) {
        params.filters.jurisdictions.forEach(jurisdiction => queryParams.append('jurisdiction', jurisdiction));
      }
      if (params.filters.courts?.length) {
        params.filters.courts.forEach(court => queryParams.append('court', court));
      }
      if (params.filters.years?.length) {
        params.filters.years.forEach(year => queryParams.append('year', year.toString()));
      }
      if (params.filters.isPublic !== undefined) {
        queryParams.append('isPublic', params.filters.isPublic.toString());
      }
      if (params.filters.dateFrom) {
        queryParams.append('dateFrom', params.filters.dateFrom);
      }
      if (params.filters.dateTo) {
        queryParams.append('dateTo', params.filters.dateTo);
      }
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/documents?${queryString}` : '/documents';
    
    return apiService.get<DocumentSearchResponse>(url);
  }

  public async getDocument(id: string): Promise<Document> {
    return apiService.get<Document>(`/documents/${id}`);
  }

  public async updateDocument(id: string, data: UpdateDocumentDto): Promise<Document> {
    return apiService.patch<Document>(`/documents/${id}`, data);
  }

  public async deleteDocument(id: string): Promise<void> {
    return apiService.delete<void>(`/documents/${id}`);
  }

  public async getDocumentDownloadUrl(id: string): Promise<{ downloadUrl: string }> {
    return apiService.get<{ downloadUrl: string }>(`/documents/${id}/download`);
  }

  public async downloadDocument(id: string, filename?: string): Promise<void> {
    const { downloadUrl } = await this.getDocumentDownloadUrl(id);
    return apiService.downloadFile(downloadUrl, filename);
  }

  public async getPublicDocuments(params: DocumentListParams = {}): Promise<DocumentSearchResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    if (params.filters) {
      if (params.filters.categories?.length) {
        params.filters.categories.forEach(category => queryParams.append('category', category));
      }
      if (params.filters.tags?.length) {
        params.filters.tags.forEach(tag => queryParams.append('tags', tag));
      }
      if (params.filters.jurisdictions?.length) {
        params.filters.jurisdictions.forEach(jurisdiction => queryParams.append('jurisdiction', jurisdiction));
      }
      if (params.filters.courts?.length) {
        params.filters.courts.forEach(court => queryParams.append('court', court));
      }
      if (params.filters.years?.length) {
        params.filters.years.forEach(year => queryParams.append('year', year.toString()));
      }
      if (params.filters.dateFrom) {
        queryParams.append('dateFrom', params.filters.dateFrom);
      }
      if (params.filters.dateTo) {
        queryParams.append('dateTo', params.filters.dateTo);
      }
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/documents/public?${queryString}` : '/documents/public';
    
    return apiService.get<DocumentSearchResponse>(url);
  }

  public async getDocumentStats(): Promise<DocumentStats> {
    return apiService.get<DocumentStats>('/documents/stats');
  }

  public async searchDocuments(searchDto: DocumentSearchDto): Promise<DocumentSearchResponse> {
    return apiService.post<DocumentSearchResponse>('/documents/search', searchDto);
  }

  public async reprocessDocument(id: string): Promise<void> {
    return apiService.post<void>(`/documents/${id}/reprocess`);
  }

  public async getDocumentChunks(id: string): Promise<any[]> {
    return apiService.get<any[]>(`/chunks/document/${id}`);
  }

  public async getChunk(id: string): Promise<any> {
    return apiService.get<any>(`/chunks/${id}`);
  }

  // Utility methods
  public getDocumentStatusColor(status: DocumentStatus): string {
    switch (status) {
      case DocumentStatus.UPLOADED:
        return 'text-blue-600 bg-blue-100';
      case DocumentStatus.PROCESSING:
        return 'text-yellow-600 bg-yellow-100';
      case DocumentStatus.INDEXED:
        return 'text-green-600 bg-green-100';
      case DocumentStatus.ERROR:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  public getDocumentStatusText(status: DocumentStatus): string {
    switch (status) {
      case DocumentStatus.UPLOADED:
        return 'Uploaded';
      case DocumentStatus.PROCESSING:
        return 'Processing';
      case DocumentStatus.INDEXED:
        return 'Ready';
      case DocumentStatus.ERROR:
        return 'Error';
      default:
        return 'Unknown';
    }
  }

  public getCategoryColor(category: DocumentCategory): string {
    switch (category) {
      case DocumentCategory.STATUTE:
        return 'text-purple-600 bg-purple-100';
      case DocumentCategory.JUDGEMENT:
        return 'text-blue-600 bg-blue-100';
      case DocumentCategory.CIRCULAR:
        return 'text-green-600 bg-green-100';
      case DocumentCategory.NOTIFICATION:
        return 'text-orange-600 bg-orange-100';
      case DocumentCategory.CONTRACT:
        return 'text-indigo-600 bg-indigo-100';
      case DocumentCategory.POLICY:
        return 'text-pink-600 bg-pink-100';
      case DocumentCategory.OTHER:
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  public formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

// Create singleton instance
export const documentService = new DocumentService();

// Export types
export type { DocumentUploadProgress, DocumentFilters, DocumentListParams, DocumentStats };
