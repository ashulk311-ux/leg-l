import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth';
import { documentService } from '../services/documents';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { TestUpload } from '../components/TestUpload';
import { AuthDebug } from '../components/AuthDebug';
import { ManualTokenTest } from '../components/ManualTokenTest';
import { TokenDebug } from '../components/TokenDebug';
import { SimpleTokenTest } from '../components/SimpleTokenTest';
import { LoginTest } from '../components/LoginTest';
import { FinalAuthTest } from '../components/FinalAuthTest';
import { LoginGuide } from '../components/LoginGuide';
import { QuickAuthFix } from '../components/QuickAuthFix';

function TestAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    }
  };

  const testDocumentsAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentService.getDocuments();
      setDocuments(response.documents);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test</CardTitle>
            <CardDescription>Test authentication and API access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isAuthenticated ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
                <Button onClick={handleLogin} className="w-full">
                  Login
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800">Authenticated</h3>
                  <p className="text-sm text-green-600">
                    User: {user?.name} ({user?.email})
                  </p>
                  <p className="text-sm text-green-600">Role: {user?.role}</p>
                </div>
                <Button onClick={handleLogout} variant="outline" className="w-full">
                  Logout
                </Button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>Documents API Test</CardTitle>
              <CardDescription>Test document API access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testDocumentsAPI} 
                loading={loading}
                className="w-full"
              >
                {loading ? 'Loading...' : 'Test Documents API'}
              </Button>

              {documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Documents ({documents.length})</h4>
                  {documents.map((doc, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-gray-600">Category: {doc.category}</p>
                      <p className="text-sm text-gray-600">Status: {doc.status}</p>
                    </div>
                  ))}
                </div>
              )}

              {documents.length === 0 && !loading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-600">No documents found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isAuthenticated && (
          <TestUpload onUploadComplete={testDocumentsAPI} />
        )}

        <QuickAuthFix />
        <LoginGuide />
        <FinalAuthTest />
        <LoginTest />
        <SimpleTokenTest />
        <TokenDebug />
        <AuthDebug />
        <ManualTokenTest />
      </div>
    </div>
  );
}

export default TestAuth;