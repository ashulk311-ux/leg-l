import { useState } from 'react';
import { useAuthStore } from '../stores/auth';
import { authService } from '../services/auth';
import { apiService } from '../services/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

export function LoginTest() {
  const { login, isAuthenticated, token, user } = useAuthStore();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      // Test direct API call first
      setResult('Step 1: Testing direct API login...');
      const directResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!directResponse.ok) {
        throw new Error(`Direct API failed: ${directResponse.status}`);
      }
      
      const directData = await directResponse.json();
      setResult(`Step 1 SUCCESS: Direct API returned token: ${directData.data.accessToken ? 'EXISTS' : 'MISSING'}`);
      
      // Test auth service login
      setResult(prev => prev + '\nStep 2: Testing auth service login...');
      await authService.login({ email, password });
      setResult(prev => prev + '\nStep 2 SUCCESS: Auth service login completed');
      
      // Test store login
      setResult(prev => prev + '\nStep 3: Testing store login...');
      await login(email, password);
      setResult(prev => prev + '\nStep 3 SUCCESS: Store login completed');
      
      // Check final state
      const finalToken = apiService.getToken();
      const finalStoreToken = token;
      const finalLocalStorageToken = localStorage.getItem('auth_token');
      
      setResult(prev => prev + `\n\nFINAL STATE:
        Store Token: ${finalStoreToken ? 'EXISTS' : 'MISSING'}
        API Service Token: ${finalToken ? 'EXISTS' : 'MISSING'}
        LocalStorage Token: ${finalLocalStorageToken ? 'EXISTS' : 'MISSING'}
        Authenticated: ${isAuthenticated ? 'YES' : 'NO'}
        User: ${user?.name || 'NONE'}`);
        
    } catch (error: any) {
      setResult(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    localStorage.removeItem('auth_token');
    apiService.clearToken();
    setResult('All tokens cleared');
  };

  const resetAuthState = () => {
    const { resetAuthState } = useAuthStore.getState();
    resetAuthState();
    setResult('Auth state completely reset');
  };

  const checkState = () => {
    const apiToken = apiService.getToken();
    const storeToken = token;
    const localStorageToken = localStorage.getItem('auth_token');
    
    setResult(`CURRENT STATE:
      Store Token: ${storeToken ? 'EXISTS' : 'MISSING'}
      API Service Token: ${apiToken ? 'EXISTS' : 'MISSING'}
      LocalStorage Token: ${localStorageToken ? 'EXISTS' : 'MISSING'}
      Authenticated: ${isAuthenticated ? 'YES' : 'NO'}
      User: ${user?.name || 'NONE'}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login Flow Test</CardTitle>
        <CardDescription>Test the complete login flow step by step</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            placeholder="test@example.com"
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            type="password"
            placeholder="password123"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={testLogin} loading={loading} disabled={loading}>
            Test Complete Login Flow
          </Button>
          <Button onClick={checkState} size="sm" variant="outline">
            Check Current State
          </Button>
          <Button onClick={clearAll} size="sm" variant="outline">
            Clear All Tokens
          </Button>
          <Button onClick={resetAuthState} size="sm" variant="outline">
            Reset Auth State
          </Button>
        </div>

        {result && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <pre className="text-sm font-mono whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p><strong>Test Steps:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Click "Test Complete Login Flow" to test all steps</li>
            <li>Check if direct API call works (Step 1)</li>
            <li>Check if auth service works (Step 2)</li>
            <li>Check if store login works (Step 3)</li>
            <li>Verify final state shows all tokens exist</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
