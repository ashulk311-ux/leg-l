import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '../../services/documents';
import { Document, DocumentStatus } from '@shared/types';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { useAuthStore } from '../../stores/auth';

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
  const [editableText, setEditableText] = useState<string>('');
  const { token } = useAuthStore();

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

  // Check if Word document already exists and load extracted text
  useEffect(() => {
    if (document?.metadata?.wordDocumentUrl) {
      setWordUrl(document.metadata.wordDocumentUrl);
    }
    // Load the extracted text for editing
    if (document?.extractedText) {
      setEditableText(document.extractedText);
    }
    // Debug log
    if (document) {
      console.log('📄 Document Debug Info:', {
        id: document._id,
        title: document.title,
        s3Key: document.s3Key,
        originalFilename: document.originalFilename,
        mimeType: document.metadata?.mimeType,
        embedUrl: `/uploads/${document.s3Key}`
      });
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-gray-700 mt-6 text-xl font-bold" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
            <span className="text-5xl">⚠️</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-5" style={{ fontFamily: "'Inter', 'system-ui', sans-serif", letterSpacing: '-0.03em' }}>Document Not Found</h1>
          <p className="text-gray-600 mb-8 text-lg font-medium" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>The requested document could not be found.</p>
          {onClose && (
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="px-8 py-4 font-bold text-white rounded-2xl text-lg border-0"
              style={{ 
                fontFamily: "Inter, 'system-ui', sans-serif",
                background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)',
                boxShadow: 'rgba(16, 185, 129, 0.4) 0px 6px 20px',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.6) 0px 10px 30px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.4) 0px 6px 20px';
              }}
            >
              ← Go back to documents
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: "'Inter', 'system-ui', sans-serif", letterSpacing: '-0.03em' }}>{document.title}</h1>
            <span className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md uppercase tracking-wider ${getStatusColor(document.status)}`} style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>
              {getStatusText(document.status)}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex gap-3">
              <button
                onClick={() => setActiveView('original')}
                className={`px-6 py-3 text-sm font-bold transition-all duration-300 rounded-xl border-0 ${
                  activeView === 'original' ? 'text-white' : 'text-gray-700'
                }`}
                style={{ 
                  fontFamily: "'Inter', 'system-ui', sans-serif",
                  background: activeView === 'original' 
                    ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)'
                    : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                  boxShadow: activeView === 'original'
                    ? '0 4px 15px rgba(59, 130, 246, 0.4)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'original') {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'original') {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)';
                  }
                }}
              >
                📄 Original
              </button>
              <button
                onClick={() => setActiveView('word')}
                className={`px-6 py-3 text-sm font-bold transition-all duration-300 rounded-xl border-0 ${
                  activeView === 'word' ? 'text-white' : 'text-gray-700'
                }`}
                disabled={!wordUrl}
                style={{ 
                  fontFamily: "'Inter', 'system-ui', sans-serif",
                  background: activeView === 'word' 
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)'
                    : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                  boxShadow: activeView === 'word'
                    ? '0 4px 15px rgba(16, 185, 129, 0.4)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  opacity: !wordUrl ? 0.5 : 1,
                  cursor: !wordUrl ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'word' && wordUrl) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'word' && wordUrl) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)';
                  }
                }}
              >
                📝 Word
              </button>
              <button
                onClick={() => setActiveView('split')}
                className={`px-6 py-3 text-sm font-bold transition-all duration-300 rounded-xl border-0 ${
                  activeView === 'split' ? 'text-white' : 'text-gray-700'
                }`}
                style={{ 
                  fontFamily: "'Inter', 'system-ui', sans-serif",
                  background: activeView === 'split' 
                    ? 'linear-gradient(135deg, #A855F7 0%, #9333EA 50%, #7E22CE 100%)'
                    : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                  boxShadow: activeView === 'split'
                    ? '0 4px 15px rgba(168, 85, 247, 0.4)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'split') {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'split') {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)';
                  }
                }}
              >
                🔀 Split View
              </button>
              <button
                onClick={() => {
                  setActiveView('chunks');
                  setShowChunks(true);
                }}
                className={`px-6 py-3 text-sm font-bold transition-all duration-300 rounded-xl border-0 ${
                  activeView === 'chunks' ? 'text-white' : 'text-gray-700'
                }`}
                style={{ 
                  fontFamily: "'Inter', 'system-ui', sans-serif",
                  background: activeView === 'chunks' 
                    ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)'
                    : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                  boxShadow: activeView === 'chunks'
                    ? '0 4px 15px rgba(245, 158, 11, 0.4)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'chunks') {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'chunks') {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)';
                  }
                }}
              >
                🧩 Chunks
              </button>
            </div>

            {/* Word Document Actions */}
            {wordUrl ? (
              <Button 
                onClick={handleDownloadWord} 
                variant="outline" 
                size="sm" 
                className="px-6 py-3 font-bold text-white rounded-xl border-0"
                style={{ 
                  fontFamily: "Inter, 'system-ui', sans-serif",
                  background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)',
                  boxShadow: 'rgba(16, 185, 129, 0.4) 0px 6px 20px',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.6) 0px 10px 30px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.4) 0px 6px 20px';
                }}
              >
                ⬇️ Download Word
              </Button>
            ) : (
              <Button 
                onClick={handleConvertToWord} 
                disabled={isConverting || document.status !== DocumentStatus.INDEXED}
                size="sm"
                className="px-6 py-3 font-bold text-white rounded-xl border-0 disabled:opacity-50"
                style={{ 
                  fontFamily: "Inter, 'system-ui', sans-serif",
                  background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)',
                  boxShadow: 'rgba(16, 185, 129, 0.4) 0px 6px 20px',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isConverting && document.status === DocumentStatus.INDEXED) {
                    e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.6) 0px 10px 30px';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isConverting && document.status === DocumentStatus.INDEXED) {
                    e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.4) 0px 6px 20px';
                  }
                }}
              >
                {isConverting ? '⏳ Converting...' : '✨ Convert to Word'}
              </Button>
            )}

            {onClose && (
              <Button 
                onClick={onClose} 
                variant="outline" 
                size="sm" 
                className="px-6 py-3 font-bold text-white rounded-xl border-0"
                style={{ 
                  fontFamily: "Inter, 'system-ui', sans-serif",
                  background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)',
                  boxShadow: 'rgba(16, 185, 129, 0.4) 0px 6px 20px',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.6) 0px 10px 30px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.4) 0px 6px 20px';
                }}
              >
                ✕ Close
              </Button>
            )}
          </div>
        </div>

        {/* Conversion Error */}
        {conversionError && (
          <div className="mt-5 p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-xl shadow-md">
            <p className="text-sm text-red-700 font-semibold" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>⚠️ {conversionError}</p>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6">
        {activeView === 'split' ? (
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Original Document */}
            <Card className="h-full shadow-xl rounded-2xl border-0 bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-blue-50 via-white to-purple-50/30 border-b border-gray-100">
                <CardTitle className="flex items-center space-x-3" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                    <span className="text-2xl">📄</span>
                  </div>
                  <span className="text-xl font-extrabold text-gray-900">Original Document</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-4">
                <div className="h-[600px] border-2 border-gray-200 rounded-2xl overflow-hidden shadow-inner">
                  {(document.metadata?.mimeType?.includes('pdf') || 
                    document.originalFilename?.toLowerCase().endsWith('.pdf') ||
                    document.type === 'PDF') ? (
                    <embed
                      src={`/uploads/${document.s3Key}`}
                      type="application/pdf"
                      className="w-full h-full"
                      title="Original Document"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="text-center">
                        <p className="text-gray-600 mb-4 font-semibold" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>Document Preview</p>
                        <Button 
                          onClick={() => window.open(`/api/v1/documents/${documentId}/download`, '_blank')}
                          variant="outline"
                          className="px-6 py-3 font-bold text-white rounded-xl border-0"
                          style={{ 
                            fontFamily: "Inter, 'system-ui', sans-serif",
                            background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)',
                            boxShadow: 'rgba(16, 185, 129, 0.4) 0px 6px 20px',
                            border: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.6) 0px 10px 30px';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.4) 0px 6px 20px';
                          }}
                        >
                          📥 Download Original
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Word Document */}
            <Card className="h-full shadow-xl rounded-2xl border-0 bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-emerald-50 via-white to-blue-50/30 border-b border-gray-100">
                <CardTitle className="flex items-center space-x-3" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md">
                    <span className="text-2xl">📝</span>
                  </div>
                  <span className="text-xl font-extrabold text-gray-900">Editable Word Document</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-4">
                <div className="h-[600px] border-2 border-gray-200 rounded-2xl overflow-hidden shadow-inner bg-white">
                  {editableText || wordUrl ? (
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-700" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>
                            ✏️ Edit Document
                          </span>
                          <span className="text-xs text-gray-500 font-medium" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>
                            {editableText.length} characters
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            onClick={() => {
                              const blob = new Blob([editableText], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${document.title || 'document'}_edited.txt`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            size="sm"
                            className="text-white px-4 py-2 rounded-lg font-bold text-xs border-0"
                            style={{ 
                              fontFamily: "Inter, 'system-ui', sans-serif",
                              background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)',
                              boxShadow: 'rgba(16, 185, 129, 0.4) 0px 4px 15px',
                              border: 'none'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.6) 0px 6px 20px';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.4) 0px 4px 15px';
                            }}
                          >
                            💾 Save Edits
                          </Button>
                          {wordUrl && (
                            <Button 
                              onClick={() => window.open(wordUrl, '_blank')}
                              size="sm"
                              className="text-white px-4 py-2 rounded-lg font-bold text-xs border-0"
                              style={{ 
                                fontFamily: "Inter, 'system-ui', sans-serif",
                                background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)',
                                boxShadow: 'rgba(16, 185, 129, 0.4) 0px 4px 15px',
                                border: 'none'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.6) 0px 6px 20px';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.4) 0px 4px 15px';
                              }}
                            >
                              📥 Download Word
                            </Button>
                          )}
                        </div>
                      </div>
                      <textarea
                        value={editableText}
                        onChange={(e) => setEditableText(e.target.value)}
                        className="flex-1 w-full p-6 resize-none focus:outline-none"
                        style={{ 
                          fontFamily: "'Georgia', 'Times New Roman', serif",
                          fontSize: '16px',
                          lineHeight: '1.8',
                          color: '#1f2937',
                          backgroundColor: '#ffffff'
                        }}
                        placeholder="Document content will appear here for editing..."
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="text-center">
                        <p className="text-gray-600 mb-6 font-semibold text-lg" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>Word document not available</p>
                        <Button 
                          onClick={handleConvertToWord}
                          disabled={isConverting || document?.status !== DocumentStatus.INDEXED}
                          size="sm"
                          className="px-6 py-3 font-bold text-white rounded-xl disabled:opacity-50 border-0"
                          style={{ 
                            fontFamily: "Inter, 'system-ui', sans-serif",
                            background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)',
                            boxShadow: 'rgba(16, 185, 129, 0.4) 0px 6px 20px',
                            border: 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (!isConverting && document?.status === DocumentStatus.INDEXED) {
                              e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.6) 0px 10px 30px';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isConverting && document?.status === DocumentStatus.INDEXED) {
                              e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.4) 0px 6px 20px';
                            }
                          }}
                        >
                          {isConverting ? '⏳ Converting...' : '✨ Convert to Word'}
                        </Button>
                        {conversionError && (
                          <p className="text-red-600 text-sm mt-4 font-semibold" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>⚠️ {conversionError}</p>
                        )}
                      </div>
                    </div>
                  )}
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
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center">
                      <p className="text-gray-600 mb-4 font-semibold" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>Document Preview</p>
                      <Button 
                        onClick={() => window.open(`/api/documents/${documentId}/download`, '_blank')}
                        variant="outline"
                        className="px-6 py-3 font-bold text-white rounded-xl border-0"
                        style={{ 
                          fontFamily: "Inter, 'system-ui', sans-serif",
                          background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)',
                          boxShadow: 'rgba(16, 185, 129, 0.4) 0px 6px 20px',
                          border: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.6) 0px 10px 30px';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'rgba(16, 185, 129, 0.4) 0px 6px 20px';
                        }}
                      >
                        📥 Download Original
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
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-50 to-blue-50">
                  <div className="text-center max-w-md p-8">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <span className="text-5xl">📝</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Word Document Ready!</h3>
                    <p className="text-gray-600 mb-8">
                      Download the editable Word version to view and edit on your device.
                    </p>
                    <Button 
                      onClick={() => window.open(wordUrl, '_blank')}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all text-lg"
                    >
                      <span className="mr-3">📥</span>
                      Download Word Document
                    </Button>
                    <p className="text-sm text-gray-500 mt-6">
                      Opens in a new tab • Compatible with Microsoft Word, Google Docs, LibreOffice
                    </p>
                  </div>
                </div>
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
