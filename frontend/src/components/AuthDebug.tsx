import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth';
import { apiService } from '../services/api';
import { documentService } from '../services/documents';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

export function AuthDebug() {
  const { user, isAuthenticated, token, login, logout } = useAuthStore();
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Check API service token
    setApiToken(apiService.getToken());
  }, []);

  const testLogin = async () => {
    try {
      await login('test@example.com', 'password123');
      setApiToken(apiService.getToken());
      setTestResult('Login successful');
    } catch (error: any) {
      setTestResult(`Login failed: ${error.message}`);
    }
  };

  const testLogout = async () => {
    try {
      await logout();
      setApiToken(apiService.getToken());
      setTestResult('Logout successful');
    } catch (error: any) {
      setTestResult(`Logout failed: ${error.message}`);
    }
  };

  const testDocumentsAPI = async () => {
    try {
      const response = await documentService.getDocuments();
      setTestResult(`API Success: Found ${response.documents.length} documents`);
    } catch (error: any) {
      setTestResult(`API Error: ${error.message}`);
    }
  };

  const checkLocalStorage = () => {
    const storedToken = localStorage.getItem('auth_token');
    setTestResult(`LocalStorage token: ${storedToken ? 'Exists' : 'Not found'}`);
  };

  const reloadToken = () => {
    apiService.reloadToken();
    setApiToken(apiService.getToken());
    setTestResult('Token reloaded from localStorage');
  };

  const syncToken = () => {
    const { syncToken } = useAuthStore.getState();
    syncToken();
    setApiToken(apiService.getToken());
    setTestResult('Token synced from auth store to API service');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
          <CardDescription>Debug authentication state and token management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Auth Store State:</h4>
              <p className="text-sm">Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p className="text-sm">User: {user?.name || 'None'}</p>
              <p className="text-sm">Token: {token ? 'Exists' : 'None'}</p>
            </div>
            <div>
              <h4 className="font-medium">API Service State:</h4>
              <p className="text-sm">Token: {apiToken ? 'Exists' : 'None'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testLogin} size="sm">
              Test Login
            </Button>
            <Button onClick={testLogout} size="sm" variant="outline">
              Test Logout
            </Button>
            <Button onClick={testDocumentsAPI} size="sm" variant="outline">
              Test Documents API
            </Button>
            <Button onClick={checkLocalStorage} size="sm" variant="outline">
              Check LocalStorage
            </Button>
            <Button onClick={reloadToken} size="sm" variant="outline">
              Reload Token
            </Button>
            <Button onClick={syncToken} size="sm" variant="outline">
              Sync Token
            </Button>
          </div>

          {testResult && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">Test Result:</p>
              <p className="text-sm text-gray-600">{testResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
