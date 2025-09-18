import { useNavigate } from 'react-router-dom';
import { SemanticSearch } from '../components/search/SemanticSearch';

export function SearchPage() {
  const navigate = useNavigate();

  const handleResultSelect = (result: any) => {
    // Navigate to document viewer with the selected result
    navigate(`/documents/${result.documentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI-Powered Search</h1>
          <p className="text-gray-600 mt-2">Find relevant legal documents using semantic search</p>
        </div>
        
        <SemanticSearch onResultSelect={handleResultSelect} />
      </div>
    </div>
  );
}
