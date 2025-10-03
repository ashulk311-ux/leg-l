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
