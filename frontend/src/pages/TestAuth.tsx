import { useAuthStore } from '../stores/auth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

function TestAuth() {
  const { user, isAuthenticated, token, login, logout } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login('test@example.com', 'password123');
      alert('Login successful!');
    } catch (error: any) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      alert('Logout successful!');
    } catch (error: any) {
      alert('Logout failed: ' + error.message);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Authentication Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
            </div>
            
            {user && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>User:</strong> {user.name} ({user.email})
              </div>
            )}
            
            {token && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Token:</strong> {token.substring(0, 20)}...
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button onClick={handleLogin}>
                Test Login
              </Button>
              <Button onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TestAuth;
