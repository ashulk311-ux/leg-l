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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
              <p className="text-gray-600 mt-2">Manage your legal documents</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant={activeTab === 'list' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('list')}
              >
                View Documents
              </Button>
              <Button
                variant={activeTab === 'upload' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('upload')}
              >
                Upload Documents
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
