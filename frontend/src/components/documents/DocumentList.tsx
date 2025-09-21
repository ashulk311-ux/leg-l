import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentIcon,
  EyeIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  TagIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatFileSize } from '../../utils/format';
import { cn } from '../../utils/cn';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { documentService, DocumentFilters, DocumentListParams } from '../../services/documents';
import { Document, DocumentStatus, DocumentCategory } from '@shared/types';
import { useDocumentStore } from '../../stores/documents';

interface DocumentListProps {
  onDocumentSelect?: (document: Document) => void;
  onDocumentDelete?: (documentId: string) => void;
  showActions?: boolean;
}

export function DocumentList({ 
  onDocumentSelect, 
  onDocumentDelete, 
  showActions = true 
}: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setLocalCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'title' | 'uploadedAt' | 'processedAt' | 'size'>('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [filters, setFilters] = useState<DocumentFilters>({
    status: [],
    categories: [],
    tags: [],
    jurisdictions: [],
    courts: [],
    years: [],
    isPublic: undefined,
  });

  const { 
    documents, 
    setDocuments, 
    setTotalCount, 
    setTotalPages,
    setFilters: setStoreFilters,
    setSearchQuery: setStoreSearchQuery,
    setSortBy: setStoreSortBy,
    setSortOrder: setStoreSortOrder,
  } = useDocumentStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['documents', currentPage, searchQuery, filters, sortBy, sortOrder],
    queryFn: async () => {
      const params: DocumentListParams = {
        page: currentPage,
        limit: 12,
        search: searchQuery || undefined,
        sortBy,
        sortOrder,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      };

      const response = await documentService.getDocuments(params);
      
      setDocuments(response.documents);
      setTotalCount(response.total);
      setLocalCurrentPage(response.page);
      setTotalPages(response.totalPages);
      
      return response;
    },
  });

  useEffect(() => {
    setStoreFilters(filters);
    setStoreSearchQuery(searchQuery);
    setStoreSortBy(sortBy);
    setStoreSortOrder(sortOrder);
  }, [filters, searchQuery, sortBy, sortOrder, setStoreFilters, setStoreSearchQuery, setStoreSortBy, setStoreSortOrder]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLocalCurrentPage(1);
  };

  const handleFilterChange = (key: keyof DocumentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setLocalCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      categories: [],
      tags: [],
      jurisdictions: [],
      courts: [],
      years: [],
      isPublic: undefined,
    });
    setSearchQuery('');
    setLocalCurrentPage(1);
  };

  const handleDelete = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.deleteDocument(documentId);
        toast.success('Document deleted successfully');
        refetch();
        onDocumentDelete?.(documentId);
      } catch (error: any) {
        toast.error('Failed to delete document');
      }
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      await documentService.downloadDocument(document._id || '', document.filename);
      toast.success('Download started');
    } catch (error: any) {
      toast.error('Failed to download document');
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    return documentService.getDocumentStatusColor(status);
  };

  const getStatusText = (status: DocumentStatus) => {
    return documentService.getDocumentStatusText(status);
  };

  const getCategoryColor = (category: DocumentCategory) => {
    return documentService.getCategoryColor(category);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load documents</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    multiple
                    value={filters.status || []}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      handleFilterChange('status', values);
                    }}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {Object.values(DocumentStatus).map((status) => (
                      <option key={status} value={status}>
                        {getStatusText(status)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    multiple
                    value={filters.categories || []}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      handleFilterChange('categories', values);
                    }}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {Object.values(DocumentCategory).map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 2024"
                    value={filters.years?.[0] || ''}
                    onChange={(e) => {
                      const year = e.target.value ? parseInt(e.target.value) : undefined;
                      handleFilterChange('years', year ? [year] : []);
                    }}
                  />
                </div>

                {/* Public Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    value={filters.isPublic === undefined ? '' : filters.isPublic.toString()}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : e.target.value === 'true';
                      handleFilterChange('isPublic', value);
                    }}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">All</option>
                    <option value="true">Public</option>
                    <option value="false">Private</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <div className="text-sm text-gray-500">
                  {data?.total || 0} document(s) found
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sort Options */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="uploadedAt">Upload Date</option>
            <option value="title">Title</option>
            <option value="processedAt">Processed Date</option>
            <option value="size">File Size</option>
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          Page {currentPage} of {data?.totalPages || 1}
        </div>
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || Object.keys(filters).length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first document to get started'
                }
              </p>
              {(!searchQuery && Object.keys(filters).length === 0) && (
                <Button>Upload Document</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <Card key={document._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{document.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {document.filename}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(document.status))}>
                        {getStatusText(document.status)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Metadata */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <TagIcon className="h-4 w-4" />
                        <span className={cn('px-2 py-1 rounded-full text-xs', getCategoryColor(document.category))}>
                          {document.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(document.uploadedAt)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DocumentIcon className="h-4 w-4" />
                        <span>{formatFileSize(document.metadata?.size || 0)}</span>
                      </div>
                      
                      {document.metadata?.jurisdiction && (
                        <div className="flex items-center space-x-2">
                          <BuildingOfficeIcon className="h-4 w-4" />
                          <span>{document.metadata?.jurisdiction}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {document.metadata?.tags && document.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {document.metadata?.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {document.metadata?.tags && document.metadata.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{document.metadata?.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {showActions && (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDocumentSelect?.(document)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(document)}
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(document._id || '')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocalCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setLocalCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocalCurrentPage(currentPage + 1)}
                disabled={currentPage === data.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
