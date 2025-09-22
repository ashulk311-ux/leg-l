import { useState } from 'react';
import { useAuthStore } from '../stores/auth';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

export function LoginGuide() {
  const { login, isAuthenticated, user, token } = useAuthStore();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setResult('Logging in...');
    
    try {
      await login(email, password);
      setResult(`✅ Login successful! Welcome ${user?.name || 'User'}!`);
    } catch (error: any) {
      setResult(`❌ Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthState = () => {
    setResult(`Current Auth State:
- Authenticated: ${isAuthenticated}
- Token: ${token ? 'EXISTS' : 'MISSING'}
- User: ${user?.name || 'NONE'}
- Token Length: ${token?.length || 0}`);
  };

  if (isAuthenticated) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">✅ Authenticated Successfully!</CardTitle>
          <CardDescription className="text-green-700">
            You are now logged in and can access protected endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-green-700">
              <strong>User:</strong> {user?.name}
            </p>
            <p className="text-sm text-green-700">
              <strong>Email:</strong> {user?.email}
            </p>
            <p className="text-sm text-green-700">
              <strong>Token:</strong> {token ? 'Present' : 'Missing'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">🔐 Login Required</CardTitle>
        <CardDescription className="text-blue-700">
          You need to log in to access protected endpoints. The 401 error is expected when not authenticated.
        </CardDescription>
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
          <Button 
            onClick={handleLogin} 
            loading={loading} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          <Button onClick={checkAuthState} size="sm" variant="outline">
            Check Auth State
          </Button>
        </div>

        {result && (
          <div className={`p-3 rounded-lg ${
            result.includes('✅') 
              ? 'bg-green-50 border border-green-200' 
              : result.includes('❌')
              ? 'bg-red-50 border border-red-200'
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <pre className="text-sm font-mono whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="text-xs text-blue-600">
          <p><strong>Why 401 Unauthorized?</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>You're not logged in (expected behavior)</li>
            <li>Protected endpoints require authentication</li>
            <li>Login above to get access token</li>
            <li>After login, API calls will work</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
