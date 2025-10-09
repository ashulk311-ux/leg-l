import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '../../services/documents';
import { useAuthStore } from '../../stores/auth';

interface SimplePDFViewerProps {
  documentId: string;
  onClose?: () => void;
}

export function SimplePDFViewer({ documentId, onClose }: SimplePDFViewerProps) {
  const { token } = useAuthStore();
  const [pdfLoadError, setPdfLoadError] = useState(false);

  // Helper function to get the correct file path
  const getDocumentPath = (doc: any) => {
    console.log('🔍 SimplePDFViewer - getDocumentPath:', {
      document: doc,
      s3Key: doc?.s3Key,
      filename: doc?.filename,
      originalFilename: doc?.originalFilename,
      _id: doc?._id
    });

    if (!doc) {
      console.error('❌ No document provided to getDocumentPath');
      return 'documents/unknown.pdf';
    }

    const s3Key = doc?.s3Key;
    const filename = doc?.filename;
    
    if (s3Key && typeof s3Key === 'string' && s3Key !== 'null' && s3Key !== 'undefined' && s3Key.length > 0) {
      console.log('✅ Using s3Key:', s3Key);
      return s3Key;
    }
    
    if (filename && typeof filename === 'string' && filename !== 'null' && filename !== 'undefined' && filename.length > 0) {
      console.log('✅ Using filename:', filename);
      return filename;
    }
    
    if (doc?._id) {
      console.log('⚠️ Falling back to document ID:', doc._id);
      return `documents/${doc._id}.pdf`;
    }
    
    console.log('❌ No valid path found');
    return 'documents/unknown.pdf';
  };

  const { data: document, isLoading, error } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => {
      console.log('🔍 SimplePDFViewer - Fetching document with ID:', documentId);
      return documentService.getDocument(documentId);
    },
    enabled: !!documentId,
    staleTime: 0,
    gcTime: 0,
  });

  // Reset error state when document changes
  useEffect(() => {
    if (document) {
      console.log('🔍 SimplePDFViewer - Document received:', {
        documentId,
        document,
        s3Key: document.s3Key,
        filename: document.filename,
        originalFilename: document.originalFilename,
        title: document.title
      });
      setPdfLoadError(false);
    }
  }, [document, documentId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading document...</p>
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
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  const pdfUrl = `/uploads/${getDocumentPath(document)}`;
  console.log('🔍 SimplePDFViewer - PDF URL:', pdfUrl);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Open in New Tab
            </button>
            <button
              onClick={async () => {
                try {
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
                  
                  const link = window.document.createElement('a');
                  link.href = downloadUrl;
                  link.download = document.originalFilename || document.filename || 'document.pdf';
                  link.style.display = 'none';
                  
                  window.document.body.appendChild(link);
                  link.click();
                  window.document.body.removeChild(link);
                } catch (error) {
                  console.error('Download failed:', error);
                  // Fallback to direct file access
                  const link = window.document.createElement('a');
                  link.href = pdfUrl;
                  link.download = document.originalFilename || document.filename || 'document.pdf';
                  link.style.display = 'none';
                  
                  window.document.body.appendChild(link);
                  link.click();
                  window.document.body.removeChild(link);
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">PDF Viewer</h2>
            <p className="text-sm text-gray-600">URL: {pdfUrl}</p>
          </div>
          
          <div className="h-[600px]">
            {pdfLoadError ? (
              <div className="flex items-center justify-center h-full bg-red-50">
                <div className="text-center p-6">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Load Error</h3>
                  <p className="text-gray-600 mb-4">Unable to display PDF in browser.</p>
                  <div className="space-x-2">
                    <button
                      onClick={() => setPdfLoadError(false)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => window.open(pdfUrl, '_blank')}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Open in New Tab
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                {/* Simple iframe approach */}
                <iframe
                  src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                  className="w-full h-full border-0"
                  title="PDF Document"
                  onError={(e) => {
                    console.error('SimplePDFViewer - iframe error:', e);
                    console.log('Failed to load PDF:', pdfUrl);
                    setPdfLoadError(true);
                  }}
                  onLoad={() => {
                    console.log('SimplePDFViewer - iframe loaded successfully:', pdfUrl);
                    setPdfLoadError(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
