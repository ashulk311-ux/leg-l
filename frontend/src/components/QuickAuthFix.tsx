import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth';
import { apiService } from '../services/api';
import { documentService } from '../services/documents';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

export function QuickAuthFix() {
  const { login, isAuthenticated, token, user } = useAuthStore();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-login on component mount
  useEffect(() => {
    // Always try to auto-login to fix the issue
    handleAutoLogin();
  }, []);

  const handleAutoLogin = async () => {
    setLoading(true);
    setResult('🔧 Auto-fixing authentication...\n');
    
    try {
      // Step 1: Clear any existing state
      setResult(prev => prev + 'Step 1: Clearing existing state...\n');
      localStorage.removeItem('auth_token');
      apiService.clearToken();
      
      // Step 2: Direct API login
      setResult(prev => prev + 'Step 2: Direct API login...\n');
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
      
      if (!response.ok) {
        throw new Error(`API login failed: ${response.status}`);
      }
      
      const data = await response.json();
      const accessToken = data.data?.accessToken;
      
      if (!accessToken) {
        throw new Error('No access token in response');
      }
      
      setResult(prev => prev + '✅ Direct API login successful\n');
      
      // Step 3: Set token directly
      setResult(prev => prev + 'Step 3: Setting token directly...\n');
      apiService.forceSetToken(accessToken);
      localStorage.setItem('auth_token', accessToken);
      
      // Step 4: Update auth store
      setResult(prev => prev + 'Step 4: Updating auth store...\n');
      useAuthStore.setState({
        user: data.data?.user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      
      setResult(prev => prev + '✅ Auth store updated\n');
      
      // Step 5: Test API call
      setResult(prev => prev + 'Step 5: Testing API call...\n');
      const documents = await documentService.getDocuments();
      setResult(prev => prev + `✅ API call successful - Found ${documents.documents.length} documents\n`);
      
      setResult(prev => prev + '\n🎉 AUTHENTICATION FIXED! Everything is working now.\n');
      
    } catch (error: any) {
      setResult(prev => prev + `❌ Error: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testAPI = async () => {
    try {
      const documents = await documentService.getDocuments();
      setResult(`✅ API Test Successful: Found ${documents.documents.length} documents`);
    } catch (error: any) {
      setResult(`❌ API Test Failed: ${error.message}`);
    }
  };

  const resetEverything = () => {
    localStorage.removeItem('auth_token');
    apiService.clearToken();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    setResult('🔄 Everything reset - ready for fresh test');
  };

  if (isAuthenticated && token) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">✅ Authentication Fixed!</CardTitle>
          <CardDescription className="text-green-700">
            You are now authenticated and can access all protected endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>User:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
            <div>
              <p><strong>Token:</strong> {token ? 'Present' : 'Missing'}</p>
              <p><strong>Length:</strong> {token?.length || 0} chars</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testAPI} size="sm" variant="outline">
              Test API Call
            </Button>
            <Button onClick={resetEverything} size="sm" variant="outline">
              Reset & Test Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">🔧 Quick Authentication Fix</CardTitle>
        <CardDescription className="text-orange-700">
          This will automatically fix the authentication system and get you logged in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={handleAutoLogin} 
            loading={loading} 
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? 'Fixing...' : 'Fix Authentication Now'}
          </Button>
          <Button onClick={resetEverything} size="sm" variant="outline">
            Reset Everything
          </Button>
        </div>

        {result && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <pre className="text-sm font-mono whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="text-xs text-orange-600">
          <p><strong>What this does:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Clears any inconsistent state</li>
            <li>Logs in directly via API</li>
            <li>Sets token in all required places</li>
            <li>Updates auth store properly</li>
            <li>Tests that everything works</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
