import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '../../services/documents';
import { Document, DocumentStatus } from '@shared/types';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Spinner } from '../ui/Spinner';

interface DualDocumentViewerProps {
  documentId: string;
  onClose?: () => void;
}

export function DualDocumentViewer({ documentId, onClose }: DualDocumentViewerProps) {
  const [wordUrl, setWordUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'original' | 'word' | 'split' | 'chunks'>('split');
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

  // Check if Word document already exists
  useEffect(() => {
    if (document?.metadata?.wordDocumentUrl) {
      setWordUrl(document.metadata.wordDocumentUrl);
    }
  }, [document]);

  const handleConvertToWord = async () => {
    if (!document) return;

    setIsConverting(true);
    setConversionError(null);

    try {
      const result = await documentService.convertDocumentToWord(documentId);
      setWordUrl(result.wordUrl);
    } catch (error: any) {
      setConversionError(error.message || 'Failed to convert document to Word format');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadWord = () => {
    if (wordUrl) {
      window.open(wordUrl, '_blank');
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
          <Spinner size="lg" />
          <p className="text-gray-600 mt-4">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Document Not Found</h1>
          <p className="text-gray-600 mb-4">The requested document could not be found.</p>
          {onClose && (
            <Button onClick={onClose} variant="outline">
              Go back to documents
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
              {getStatusText(document.status)}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setActiveView('original')}
                className={`px-3 py-2 text-sm font-medium ${
                  activeView === 'original'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setActiveView('word')}
                className={`px-3 py-2 text-sm font-medium ${
                  activeView === 'word'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                disabled={!wordUrl}
              >
                Word
              </button>
              <button
                onClick={() => setActiveView('split')}
                className={`px-3 py-2 text-sm font-medium ${
                  activeView === 'split'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                disabled={!wordUrl}
              >
                Split View
              </button>
              <button
                onClick={() => {
                  setActiveView('chunks');
                  setShowChunks(true);
                }}
                className={`px-3 py-2 text-sm font-medium ${
                  activeView === 'chunks'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Chunks
              </button>
            </div>

            {/* Word Document Actions */}
            {wordUrl ? (
              <Button onClick={handleDownloadWord} variant="outline" size="sm">
                Download Word
              </Button>
            ) : (
              <Button 
                onClick={handleConvertToWord} 
                disabled={isConverting || document.status !== DocumentStatus.INDEXED}
                size="sm"
              >
                {isConverting ? 'Converting...' : 'Convert to Word'}
              </Button>
            )}

            {onClose && (
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Conversion Error */}
        {conversionError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{conversionError}</p>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6">
        {activeView === 'split' && wordUrl ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Original Document */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="emoji">📄</span>
                  <span>Original Document</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="h-96 border border-gray-200 rounded-lg overflow-hidden">
                  {document.type === 'PDF' ? (
                    <iframe
                      src={`/api/documents/${documentId}/view`}
                      className="w-full h-full"
                      title="Original Document"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <div className="text-center">
                        <p className="text-gray-500 mb-2">Document Preview</p>
                        <Button 
                          onClick={() => window.open(`/api/documents/${documentId}/download`, '_blank')}
                          variant="outline"
                        >
                          Download Original
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Word Document */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="emoji">📝</span>
                  <span>Editable Word Document</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="h-96 border border-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(wordUrl)}`}
                    className="w-full h-full"
                    title="Word Document"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : activeView === 'original' ? (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="emoji">📄</span>
                <span>Original Document</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className="h-96 border border-gray-200 rounded-lg overflow-hidden">
                {document.type === 'PDF' ? (
                  <iframe
                    src={`/api/documents/${documentId}/view`}
                    className="w-full h-full"
                    title="Original Document"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50">
                    <div className="text-center">
                      <p className="text-gray-500 mb-2">Document Preview</p>
                      <Button 
                        onClick={() => window.open(`/api/documents/${documentId}/download`, '_blank')}
                        variant="outline"
                      >
                        Download Original
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : activeView === 'word' && wordUrl ? (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="emoji">📝</span>
                <span>Editable Word Document</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className="h-96 border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(wordUrl)}`}
                  className="w-full h-full"
                  title="Word Document"
                />
              </div>
            </CardContent>
          </Card>
        ) : activeView === 'chunks' ? (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="emoji">🧩</span>
                <span>Document Chunks</span>
                {chunks && <span className="text-sm text-gray-500">({chunks.length})</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className="h-96 overflow-y-auto">
                {chunksLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading chunks...</p>
                    </div>
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
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-gray-400 text-4xl mb-4">🧩</div>
                      <p className="text-gray-500">No chunks available for this document.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Word Document Not Available</h3>
            <p className="text-gray-500 mb-4">
              Convert the document to Word format to view the editable version.
            </p>
            <Button 
              onClick={handleConvertToWord} 
              disabled={isConverting || document.status !== DocumentStatus.INDEXED}
            >
              {isConverting ? 'Converting...' : 'Convert to Word'}
            </Button>
          </div>
        )}

        {/* Document Chunks (if available) */}
        {chunks && chunks.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="emoji">🧩</span>
                <span>Document Chunks ({chunks.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-64 overflow-y-auto">
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
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                      {chunk.chunkText}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
