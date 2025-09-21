import { useParams, useNavigate } from 'react-router-dom';
import { DocumentViewer } from '../components/documents/DocumentViewer';

function DocumentViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/documents');
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Document Not Found</h1>
          <p className="text-gray-600 mb-4">No document ID provided.</p>
          <button
            onClick={() => navigate('/documents')}
            className="text-primary-600 hover:text-primary-500"
          >
            Go back to documents
          </button>
        </div>
      </div>
    );
  }

  return <DocumentViewer documentId={id} onClose={handleClose} />;
}

export default DocumentViewerPage;
