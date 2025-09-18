import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DocumentIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatFileSize } from '../../utils/format';

import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { documentService } from '../../services/documents';
import { Document, DocumentStatus } from '@shared/types';

interface DocumentViewerProps {
  documentId: string;
  onClose?: () => void;
}

export function DocumentViewer({ documentId, onClose }: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChunks, setShowChunks] = useState(false);

  const { data: document, isLoading, error } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => documentService.getDocument(documentId),
    enabled: !!documentId,
  });

  const { data: chunks, isLoading: chunksLoading } = useQuery({
    queryKey: ['document-chunks', documentId],
    queryFn: () => documentService.getDocumentChunks(documentId),
    enabled: !!documentId && showChunks,
  });

  const handleDownload = async () => {
    if (!document) return;
    
    try {
      await documentService.downloadDocument(document._id, document.filename);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async () => {
    if (!document) return;
    
    try {
      const { downloadUrl } = await documentService.getDocumentDownloadUrl(document._id);
      await navigator.clipboard.writeText(downloadUrl);
      // Show success toast
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    return documentService.getDocumentStatusColor(status);
  };

  const getStatusText = (status: DocumentStatus) => {
    return documentService.getDocumentStatusText(status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Document not found</h3>
            <p className="text-gray-500 mb-4">
              The document you're looking for doesn't exist or you don't have permission to view it.
            </p>
            {onClose && (
              <Button onClick={onClose}>Go Back</Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900 truncate max-w-md">
                  {document.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {document.filename} • {formatFileSize(document.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                {getStatusText(document.status)}
              </span>
              
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Download
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleShare}>
                <ShareIcon className="h-4 w-4 mr-1" />
                Share
              </Button>
              
              <Button variant="outline" size="sm">
                <PrinterIcon className="h-4 w-4 mr-1" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Document Content</CardTitle>
                    <CardDescription>
                      {document.status === DocumentStatus.INDEXED 
                        ? 'Document has been processed and is ready for viewing'
                        : 'Document is being processed...'
                      }
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChunks(!showChunks)}
                    >
                      <BookmarkIcon className="h-4 w-4 mr-1" />
                      {showChunks ? 'Hide' : 'Show'} Chunks
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {document.status === DocumentStatus.INDEXED ? (
                  <div className="space-y-4">
                    {/* Search within document */}
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search within document..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Document text content */}
                    <div className="prose max-w-none">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">
                          This is a placeholder for the document content. In a real implementation, 
                          this would display the extracted text from the document with proper formatting, 
                          page breaks, and search highlighting.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-4">
                          The document viewer would support:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                          <li>Full-text display with proper formatting</li>
                          <li>Search highlighting within the document</li>
                          <li>Page navigation for multi-page documents</li>
                          <li>Zoom controls for better readability</li>
                          <li>Text selection and copying</li>
                        </ul>
                      </div>
                    </div>

                    {/* Chunks view */}
                    {showChunks && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Chunks</h3>
                        {chunksLoading ? (
                          <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                              </div>
                            ))}
                          </div>
                        ) : chunks && chunks.length > 0 ? (
                          <div className="space-y-4">
                            {chunks.map((chunk: any, index: number) => (
                              <div key={chunk._id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-600">
                                    Chunk {index + 1}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {chunk.tokenCount} tokens
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {chunk.chunkText}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            No chunks available for this document.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Document</h3>
                    <p className="text-gray-500">
                      Your document is being processed. This may take a few minutes.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document Info */}
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-sm text-gray-900 capitalize">{document.category}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Uploaded</label>
                  <p className="text-sm text-gray-900">{formatDate(document.uploadedAt)}</p>
                </div>
                
                {document.processedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Processed</label>
                    <p className="text-sm text-gray-900">{formatDate(document.processedAt)}</p>
                  </div>
                )}
                
                {document.jurisdiction && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Jurisdiction</label>
                    <p className="text-sm text-gray-900">{document.jurisdiction}</p>
                  </div>
                )}
                
                {document.court && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Court</label>
                    <p className="text-sm text-gray-900">{document.court}</p>
                  </div>
                )}
                
                {document.year && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Year</label>
                    <p className="text-sm text-gray-900">{document.year}</p>
                  </div>
                )}
                
                {document.caseNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Case Number</label>
                    <p className="text-sm text-gray-900">{document.caseNumber}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Actions */}
            {document.status === DocumentStatus.INDEXED && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <LightBulbIcon className="h-4 w-4 mr-2" />
                    Summarize Document
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Ask Questions
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                    Find Similar
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
