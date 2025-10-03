import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DocumentUpload } from '../components/documents/DocumentUpload';
import { CategoryUpload } from '../components/documents/CategoryUpload';
import { DocumentList } from '../components/documents/DocumentList';
import { Button } from '../components/ui/Button';
import { Document, DocumentCategory } from '@shared/types';

function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const category = searchParams.get('category') as DocumentCategory | null;
  const tab = searchParams.get('tab');

  useEffect(() => {
    if (tab === 'upload') {
      setActiveTab('upload');
    }
  }, [tab]);

  const handleDocumentSelect = (document: Document) => {
    navigate(`/documents/${document._id}`);
  };

  const handleDocumentDelete = (documentId: string) => {
    console.log('Deleted document:', documentId);
    // Refresh the list or remove from state
  };

  const handleUploadComplete = () => {
    // Optionally navigate back to list or show success message
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
      <div className="container py-8">
        {/* Professional Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-secondary-900 mb-4 tracking-tight">
                Document Management
              </h1>
              <p className="text-xl text-secondary-600 leading-relaxed max-w-2xl">
                Organize, manage, and process your legal documents with intelligent processing
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant={activeTab === 'list' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('list')}
                className="px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <span className="emoji-xs">📄</span>
                  View Documents
                </span>
              </Button>
              <Button
                variant={activeTab === 'upload' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('upload')}
                className="px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <span className="emoji-xs">📤</span>
                  Upload Documents
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'list' ? (
          <DocumentList
            onDocumentSelect={handleDocumentSelect}
            onDocumentDelete={handleDocumentDelete}
            showActions={true}
          />
        ) : (
          category && Object.values(DocumentCategory).includes(category) ? (
            <CategoryUpload 
              category={category} 
              onUploadComplete={handleUploadComplete}
            />
          ) : (
            <DocumentUpload />
          )
        )}
      </div>
    </div>
  );
}

export default DocumentsPage;
