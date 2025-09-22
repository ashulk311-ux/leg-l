import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuthStore } from '../stores/auth';
import { documentService } from '../services/documents';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

export function TokenDebug() {
  const { token, isAuthenticated } = useAuthStore();
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    const updateTokens = () => {
      setApiToken(apiService.getToken());
      setLocalStorageToken(localStorage.getItem('auth_token'));
    };
    
    updateTokens();
    const interval = setInterval(updateTokens, 1000);
    return () => clearInterval(interval);
  }, []);

  const forceSyncToken = () => {
    if (token) {
      apiService.setToken(token);
      setApiToken(apiService.getToken());
      setTestResult('Token synced to API service');
    } else {
      setTestResult('No token in auth store');
    }
  };

  const testDirectAPI = async () => {
    setTestResult('Testing...');
    try {
      const response = await documentService.getDocuments();
      setTestResult(`SUCCESS: Found ${response.documents.length} documents`);
    } catch (error: any) {
      setTestResult(`ERROR: ${error.message}`);
    }
  };

  const setManualToken = () => {
    const manualToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGNmZGEwNDQ1M2YwMDhkM2M5NGUxODkiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1ODUzNTExMCwiZXhwIjoxNzU4NjIxNTEwfQ.GZgC9X7pAlhXoRGiI6Nf4lTli6-Pe0AKtlqM00DBjY4';
    apiService.setToken(manualToken);
    setApiToken(apiService.getToken());
    setTestResult('Manual token set');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Debug (Real-time)</CardTitle>
        <CardDescription>Monitor token state across all sources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Auth Store</h4>
            <p className="text-sm text-blue-700">
              Authenticated: {isAuthenticated ? 'Yes' : 'No'}
            </p>
            <p className="text-sm text-blue-700">
              Token: {token ? 'Exists' : 'None'}
            </p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">API Service</h4>
            <p className="text-sm text-green-700">
              Token: {apiToken ? 'Exists' : 'None'}
            </p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900">LocalStorage</h4>
            <p className="text-sm text-purple-700">
              Token: {localStorageToken ? 'Exists' : 'None'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={forceSyncToken} size="sm">
            Force Sync Token
          </Button>
          <Button onClick={setManualToken} size="sm" variant="outline">
            Set Manual Token
          </Button>
          <Button onClick={testDirectAPI} size="sm" variant="outline">
            Test API Call
          </Button>
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg ${
            testResult.startsWith('SUCCESS') 
              ? 'bg-green-50 border border-green-200' 
              : testResult.startsWith('ERROR')
              ? 'bg-red-50 border border-red-200'
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <p className={`text-sm font-medium ${
              testResult.startsWith('SUCCESS') 
                ? 'text-green-800' 
                : testResult.startsWith('ERROR')
                ? 'text-red-800'
                : 'text-gray-800'
            }`}>
              {testResult}
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p><strong>Debug Steps:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Check if all three sources show "Token: Exists"</li>
            <li>If not, click "Force Sync Token" or "Set Manual Token"</li>
            <li>Click "Test API Call" to verify it works</li>
            <li>If manual token works but sync doesn't, there's a sync issue</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
