import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, Variants } from 'framer-motion';
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
import { useAuthStore } from '../../stores/auth';

interface DocumentListProps {
  onDocumentSelect?: (document: Document) => void;
  onDocumentDelete?: (documentId: string) => void;
  showActions?: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
      mass: 0.5,
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
  tap: {
    scale: 0.98,
  },
};

const searchVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 150,
      damping: 20,
    },
  },
};

export function DocumentList({ 
  onDocumentSelect, 
  onDocumentDelete, 
  showActions = true 
}: DocumentListProps) {
  const { token } = useAuthStore();
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
    // documents, 
    setDocuments, 
    setTotalCount, 
    setTotalPages,
    setFilters: setStoreFilters,
    setSearchQuery: setStoreSearchQuery,
    setSortBy: setStoreSortBy,
    setSortOrder: setStoreSortOrder,
  } = useDocumentStore();

  // Ensure documents is always an array
  // const safeDocuments = documents || [];

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

  // Helper function to get the correct file path
  const getDocumentPath = (doc: Document) => {
    console.log('🔍 DocumentList Path Debug:', {
      document: doc,
      s3Key: doc?.s3Key,
      filename: doc?.filename,
      originalFilename: doc?.originalFilename,
      _id: doc?._id
    });

    if (doc?.s3Key && doc.s3Key !== 'null' && doc.s3Key !== 'undefined') {
      console.log('✅ Using s3Key:', doc.s3Key);
      return doc.s3Key;
    }
    
    if (doc?.filename && doc.filename !== 'null' && doc.filename !== 'undefined') {
      console.log('✅ Using filename:', doc.filename);
      return doc.filename;
    }
    
    if (doc?._id) {
      console.log('⚠️ Falling back to document ID:', doc._id);
      return `documents/${doc._id}.pdf`;
    }
    
    console.log('❌ No valid path found');
    return 'documents/unknown.pdf';
  };

  const handleDownload = async (document: Document) => {
    try {
      // Use the API endpoint to get the proper download URL
      const response = await fetch(`/api/v1/documents/${document._id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const downloadUrl = data.url;
      
      console.log('🔍 Download Debug:', {
        document,
        apiUrl: `/api/v1/documents/${document._id}/download`,
        downloadUrl,
        originalFilename: document.originalFilename,
        s3Key: document.s3Key
      });
      
      // Create download link with the proper URL and original filename
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = document.originalFilename || document.filename || 'document';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Add to DOM, click, and remove
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error: any) {
      console.error('Download failed:', error);
      // Fallback to direct file access
      try {
        const downloadUrl = `/uploads/${getDocumentPath(document)}`;
        const link = window.document.createElement('a');
        link.href = downloadUrl;
        link.download = document.originalFilename || document.filename || 'document';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        
        toast.success('Download started (fallback)');
      } catch (fallbackError) {
        console.error('Fallback download failed:', fallbackError);
        toast.error('Failed to download document');
      }
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
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-black mb-3" style={{ fontFamily: "'Inter', 'system-ui', sans-serif", letterSpacing: '-0.04em', fontSize: '25px', color: '#444' }}>
          📚 Document Library
        </h1>
        <p className="text-xl font-medium" style={{ fontFamily: "'Inter', 'system-ui', sans-serif", color: '#444' }}>
          Manage and explore your legal documents with AI-powered insights
        </p>
      </div>

      {/* Professional Search and Filters Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={searchVariants}
      >
        <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
          <CardContent className="py-8 px-8">
          <div className="flex flex-row gap-4 items-center">
            {/* Enhanced Search */}
            <div style={{ width: '85%' }}>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200">
                  <MagnifyingGlassIcon className="h-5 w-5 text-white" />
                </div>
                <Input
                  placeholder="Search documents by title, content, or tags..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-16 pr-6 py-6 text-base font-semibold border-0 focus:ring-2 focus:ring-blue-500/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                  style={{ fontFamily: "'Inter', 'system-ui', sans-serif", boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', width: '100%' }}
                />
              </div>
            </div>

            {/* Professional Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              className="flex items-center space-x-2 h-16 px-8 text-base font-bold border-0 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex-shrink-0"
              style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </Button>
          </div>

          {/* Professional Advanced Filters */}
          {showFilters && (
            <div className="mt-8 pt-8 border-t border-gray-200/60">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#444' }}>
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
                    <label className="block text-sm font-medium mb-2" style={{ color: '#444' }}>
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
                    <label className="block text-sm font-medium mb-2" style={{ color: '#444' }}>
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
                    <label className="block text-sm font-medium mb-2" style={{ color: '#444' }}>
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
                  <div className="text-sm" style={{ color: '#444' }}>
                    {data?.total || 0} document(s) found
                  </div>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>

        {/* Sort Options */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm" style={{ color: '#444' }}>Sort by:</span>
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

          <div className="text-sm" style={{ color: '#444' }}>
            Page {currentPage} of {data?.totalPages || 1}
          </div>
        </div>

          {/* Document Grid */}
          {isLoading ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={cardVariants}
                >
                  <Card className="border-0 bg-white/50 shadow-xl rounded-3xl overflow-hidden">
                    <CardContent className="p-8">
                      <div className="relative overflow-hidden">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                        
                        <div className="space-y-6">
                          <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-3/4 animate-pulse"></div>
                          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/2 animate-pulse"></div>
                          
                          <div className="space-y-4 pt-4">
                            <div className="flex items-center space-x-4">
                              <div className="h-12 w-12 bg-gradient-to-br from-blue-200 to-blue-300 rounded-2xl animate-pulse"></div>
                              <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-24 animate-pulse"></div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="h-12 w-12 bg-gradient-to-br from-purple-200 to-purple-300 rounded-2xl animate-pulse"></div>
                              <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-32 animate-pulse"></div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="h-12 w-12 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-2xl animate-pulse"></div>
                              <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-20 animate-pulse"></div>
                            </div>
                          </div>
                          
                          <div className="pt-6 border-t-2 border-gray-100 grid grid-cols-3 gap-3">
                            <div className="h-12 bg-gradient-to-r from-blue-200 to-blue-300 rounded-2xl animate-pulse"></div>
                            <div className="h-12 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-2xl animate-pulse"></div>
                            <div className="h-12 bg-gradient-to-r from-red-200 to-red-300 rounded-2xl animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
      ) : (!data?.documents || data.documents.length === 0) ? (
        <Card className="border-0 bg-white shadow-2xl rounded-3xl">
          <CardContent className="py-24">
            <div className="text-center">
                  <div className="mx-auto w-28 h-28 bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 rounded-3xl flex items-center justify-center mb-10 shadow-2xl">
                    <DocumentIcon className="h-14 w-14 text-blue-600" />
                  </div>
                  <h3 className="text-4xl font-black mb-5" style={{ fontFamily: "'Inter', 'system-ui', sans-serif", letterSpacing: '-0.03em', color: '#444' }}>No documents found</h3>
                  <p className="mb-10 max-w-2xl mx-auto text-xl leading-relaxed font-medium" style={{ fontFamily: "'Inter', 'system-ui', sans-serif", color: '#444' }}>
                {searchQuery || Object.keys(filters).length > 0
                  ? 'Try adjusting your search criteria or filters to find what you\'re looking for'
                  : 'Get started by uploading your first legal document and unlock powerful AI-driven insights'
                }
              </p>
              {(!searchQuery && Object.keys(filters).length === 0) && (
                <Button className="px-10 py-5 text-lg font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>
                  <span className="text-2xl mr-3">📤</span>
                  Upload Your First Document
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
          <>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {data?.documents?.map((document) => (
                <motion.div
                  key={document._id}
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  layout
                >
                  <Card className="group border-0 bg-white shadow-xl rounded-3xl overflow-hidden h-full">
                <CardHeader className="pb-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 relative">
                  {/* Decorative top bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                  
                    <div className="flex items-start justify-between pt-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-black truncate group-hover:text-blue-600 transition-colors duration-300 mb-1" style={{ fontFamily: "'Inter', 'system-ui', sans-serif", letterSpacing: '-0.03em', color: '#444' }}>
                          {document.title}
                        </CardTitle>
                        <CardDescription className="mt-3 text-sm font-bold tracking-wide uppercase" style={{ fontFamily: "'Inter', 'system-ui', sans-serif", fontSize: '0.75rem', color: '#444' }}>
                          {document.filename}
                        </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={cn('px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-lg uppercase tracking-widest', getStatusColor(document.status))} style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>
                        {getStatusText(document.status)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-8 px-7 pb-7">
                  <div className="space-y-7">
                    {/* Enhanced Metadata */}
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-2xl p-5 space-y-4 border border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                          <TagIcon className="h-5 w-5" style={{ color: '#444' }} />
                        </div>
                        <span className={cn('px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-md uppercase tracking-widest', getCategoryColor(document.category))} style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>
                          {document.category.charAt(0).toUpperCase() + document.category.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                          <CalendarIcon className="h-5 w-5" style={{ color: '#444' }} />
                        </div>
                        <span className="font-bold text-sm" style={{ fontFamily: "'Inter', 'system-ui', sans-serif", color: '#444' }}>{formatDate(document.uploadedAt)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
                          <DocumentIcon className="h-5 w-5" style={{ color: '#444' }} />
                        </div>
                        <span className="font-bold text-sm" style={{ fontFamily: "'Inter', 'system-ui', sans-serif", color: '#444' }}>{formatFileSize(document.metadata?.size || 0)}</span>
                      </div>
                      
                      {document.metadata?.jurisdiction && (
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg">
                            <BuildingOfficeIcon className="h-5 w-5" style={{ color: '#444' }} />
                          </div>
                          <span className="font-bold text-sm" style={{ fontFamily: "'Inter', 'system-ui', sans-serif", color: '#444' }}>{document.metadata?.jurisdiction}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {document.metadata?.tags && document.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2.5">
                        {document.metadata?.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs font-bold rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
                            style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}
                          >
                            #{tag}
                          </span>
                        ))}
                        {document.metadata?.tags && document.metadata.tags.length > 3 && (
                          <span className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-xs font-bold rounded-xl border-2 border-gray-200 shadow-sm" style={{ fontFamily: "'Inter', 'system-ui', sans-serif", color: '#444' }}>
                            +{document.metadata?.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Professional Action Buttons */}
                    {showActions && (
                      <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                        <div className="flex items-center gap-3 w-full">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDocumentSelect?.(document)}
                            className="flex-1 px-5 py-4 text-white rounded-2xl transition-all duration-300 font-bold hover:scale-110 flex items-center justify-center border-0"
                            title="View document"
                            style={{ 
                              fontFamily: "'Inter', 'system-ui', sans-serif", 
                              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
                              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                              border: 'none',
                              color: '#FFFFFF'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #1E40AF 100%)';
                              e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)';
                              e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                            }}
                          >
                            <EyeIcon className="h-5 w-5 mr-2 text-white" style={{ color: '#FFFFFF' }} />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(document)}
                            className="flex-1 px-5 py-4 text-white rounded-2xl transition-all duration-300 font-bold hover:scale-110 flex items-center justify-center border-0"
                            title="Download document"
                            style={{ 
                              fontFamily: "'Inter', 'system-ui', sans-serif", 
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
                              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                              border: 'none',
                              color: '#FFFFFF'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 50%, #065F46 100%)';
                              e.currentTarget.style.boxShadow = '0 8px 25px rgba(5, 150, 105, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)';
                              e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                            }}
                          >
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-white" style={{ color: '#FFFFFF' }} />
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(document._id || '')}
                            className="p-4 text-white rounded-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-0"
                            title="Delete document"
                            style={{ 
                              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)',
                              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                              border: 'none',
                              color: '#FFFFFF'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%)';
                              e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)';
                              e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
                            }}
                          >
                            <TrashIcon className="h-5 w-5 text-white" style={{ color: '#FFFFFF' }} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
                </motion.div>
            ))}
          </motion.div>

          {/* Professional Pagination */}
          {data?.totalPages && data.totalPages > 1 && (
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
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
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
                disabled={currentPage === data.totalPages}
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
