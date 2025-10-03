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

  // Ensure documents is always an array
  const safeDocuments = documents || [];

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
      
      console.log('DocumentList - API Response:', response);
      console.log('DocumentList - Documents count:', response.documents?.length);
      
      setDocuments(response.documents || []);
      setTotalCount(response.total || 0);
      setLocalCurrentPage(response.page || 1);
      setTotalPages(response.totalPages || 1);
      
      return response;
    },
  });

  useEffect(() => {
    setStoreFilters(filters);
    setStoreSearchQuery(searchQuery);
    setStoreSortBy(sortBy);
    setStoreSortOrder(sortOrder);
  }, [filters, searchQuery, sortBy, sortOrder, setStoreFilters, setStoreSearchQuery, setStoreSortBy, setStoreSortOrder]);

  // Debug logging
  useEffect(() => {
    console.log('DocumentList - Data changed:', { 
      hasData: !!data, 
      documentsLength: data?.documents?.length,
      isLoading,
      documents: data?.documents 
    });
  }, [data, isLoading]);

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
    <div className="space-y-8">
      {/* Professional Search and Filters Header */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl">
        <CardContent className="py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Enhanced Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search documents by title, content, or tags..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 pr-4 py-4 text-base border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl shadow-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Professional Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-3 h-14 px-8 text-sm font-medium border-gray-300 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 shadow-sm"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Advanced Filters</span>
            </Button>
          </div>

          {/* Professional Advanced Filters */}
          {showFilters && (
            <div className="mt-8 pt-8 border-t border-gray-200/60">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <Card key={i} className="animate-pulse border-0 bg-white/50">
              <CardContent className="p-6">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (!data?.documents || data.documents.length === 0) ? (
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl">
          <CardContent className="py-20">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <DocumentIcon className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No documents found</h3>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                {searchQuery || Object.keys(filters).length > 0
                  ? 'Try adjusting your search criteria or filters to find what you\'re looking for'
                  : 'Get started by uploading your first legal document'
                }
              </p>
              {(!searchQuery && Object.keys(filters).length === 0) && (
                <Button className="px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  📤 Upload Your First Document
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.documents?.map((document) => (
              <Card key={document._id} className="hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm group rounded-2xl overflow-hidden">
                <CardHeader className="pb-6 bg-gradient-to-r from-gray-50/50 to-gray-100/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors duration-200">
                        {document.title}
                      </CardTitle>
                      <CardDescription className="mt-3 text-sm text-gray-600 font-medium">
                        {document.filename}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={cn('px-4 py-2 rounded-xl text-xs font-bold shadow-md', getStatusColor(document.status))}>
                        {getStatusText(document.status)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Enhanced Metadata */}
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <TagIcon className="h-4 w-4 text-primary-600" />
                        </div>
                        <span className={cn('px-4 py-2 rounded-xl text-xs font-bold shadow-sm', getCategoryColor(document.category))}>
                          {document.category.charAt(0).toUpperCase() + document.category.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CalendarIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-gray-700 font-medium">{formatDate(document.uploadedAt)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DocumentIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">{formatFileSize(document.metadata?.size || 0)}</span>
                      </div>
                      
                      {document.metadata?.jurisdiction && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <BuildingOfficeIcon className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="text-gray-700 font-medium">{document.metadata?.jurisdiction}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {document.metadata?.tags && document.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {document.metadata?.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                          >
                            #{tag}
                          </span>
                        ))}
                        {document.metadata?.tags && document.metadata.tags.length > 3 && (
                          <span className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                            +{document.metadata?.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Professional Action Buttons */}
                    {showActions && (
                      <div className="flex items-center justify-between pt-6 border-t border-gray-200/60">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDocumentSelect?.(document)}
                            className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                            title="View document"
                          >
                            <EyeIcon className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(document)}
                            className="px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium"
                            title="Download document"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(document._id || '')}
                            className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                            title="Delete document"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Professional Pagination */}
          {data?.data && data.data.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocalCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-6 py-2.5 text-sm font-medium rounded-lg border-gray-300 hover:border-primary-500 hover:text-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, data.data.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setLocalCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === page 
                          ? 'bg-primary-600 text-white shadow-lg' 
                          : 'hover:bg-gray-100 hover:text-primary-600'
                      }`}
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
                disabled={currentPage === data.data.totalPages}
                className="px-6 py-2.5 text-sm font-medium rounded-lg border-gray-300 hover:border-primary-500 hover:text-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
