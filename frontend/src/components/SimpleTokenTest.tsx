import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { documentService } from '../services/documents';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

export function SimpleTokenTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const checkToken = () => {
    const token = apiService.getToken();
    const localStorageToken = localStorage.getItem('auth_token');
    
    setResult(`
      API Service Token: ${token ? 'EXISTS' : 'MISSING'}
      LocalStorage Token: ${localStorageToken ? 'EXISTS' : 'MISSING'}
      Tokens Match: ${token === localStorageToken ? 'YES' : 'NO'}
    `);
  };

  const setTestToken = () => {
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGNmZGEwNDQ1M2YwMDhkM2M5NGUxODkiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1ODUzNTExMCwiZXhwIjoxNzU4NjIxNTEwfQ.GZgC9X7pAlhXoRGiI6Nf4lTli6-Pe0AKtlqM00DBjY4';
    apiService.forceSetToken(testToken);
    setResult('Test token force set successfully');
  };

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing API call...');
    
    try {
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
    setResult('Token cleared');
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple Token Test</CardTitle>
        <CardDescription>Basic token verification and API testing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={checkToken} size="sm">
            Check Token
          </Button>
          <Button onClick={setTestToken} size="sm" variant="outline">
            Set Test Token
          </Button>
          <Button onClick={testAPI} size="sm" variant="outline" loading={loading}>
            Test API
          </Button>
          <Button onClick={clearToken} size="sm" variant="outline">
            Clear Token
          </Button>
        </div>

        {result && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <pre className="text-sm font-mono whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Click "Check Token" to see current state</li>
            <li>Click "Set Test Token" to load a working token</li>
            <li>Click "Test API" to verify it works</li>
            <li>If this works, the issue is in token synchronization</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
