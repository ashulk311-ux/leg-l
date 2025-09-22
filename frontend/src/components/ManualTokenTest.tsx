import { useState } from 'react';
import { apiService } from '../services/api';
import { documentService } from '../services/documents';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

export function ManualTokenTest() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testToken = async () => {
    if (!token.trim()) {
      setResult('Please enter a token');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      // Set the token manually
      apiService.setToken(token);
      
      // Test the documents API
      const response = await documentService.getDocuments();
      setResult(`SUCCESS: Found ${response.documents.length} documents`);
    } catch (error: any) {
      setResult(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearToken = () => {
    apiService.clearToken();
    setToken('');
    setResult('Token cleared');
  };

  const setTestToken = () => {
    // Use the token from our curl test
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGNmZGEwNDQ1M2YwMDhkM2M5NGUxODkiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1ODUzNTExMCwiZXhwIjoxNzU4NjIxNTEwfQ.GZgC9X7pAlhXoRGiI6Nf4lTli6-Pe0AKtlqM00DBjY4';
    setToken(testToken);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Token Test</CardTitle>
        <CardDescription>
          Test API calls with a manually set token to verify the authentication flow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter JWT token here"
            label="JWT Token"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={setTestToken} variant="outline" size="sm">
            Use Test Token
          </Button>
          <Button onClick={testToken} loading={loading} disabled={!token.trim()}>
            Test API Call
          </Button>
          <Button onClick={clearToken} variant="outline" size="sm">
            Clear Token
          </Button>
        </div>

        {result && (
          <div className={`p-3 rounded-lg ${
            result.startsWith('SUCCESS') 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-medium ${
              result.startsWith('SUCCESS') ? 'text-green-800' : 'text-red-800'
            }`}>
              {result}
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Click "Use Test Token" to load a working token</li>
            <li>Click "Test API Call" to verify the token works</li>
            <li>If successful, the issue is in token synchronization</li>
            <li>If failed, check the browser console for errors</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
