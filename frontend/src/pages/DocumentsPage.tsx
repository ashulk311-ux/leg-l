import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentUpload } from '../components/documents/DocumentUpload';
import { DocumentList } from '../components/documents/DocumentList';
import { Button } from '../components/ui/Button';
import { Document } from '@shared/types';

export function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');
  const navigate = useNavigate();

  const handleDocumentSelect = (document: Document) => {
    navigate(`/documents/${document._id}`);
  };

  const handleDocumentDelete = (documentId: string) => {
    console.log('Deleted document:', documentId);
    // Refresh the list or remove from state
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
          <DocumentUpload />
        )}
      </div>
    </div>
  );
}
