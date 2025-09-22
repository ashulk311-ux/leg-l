import { useState } from 'react';
import { useAuthStore } from '../stores/auth';
import { documentService } from '../services/documents';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

export function FinalAuthTest() {
  const { login, isAuthenticated, token, user, logout } = useAuthStore();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testCompleteFlow = async () => {
    setLoading(true);
    setResult('Testing complete authentication flow...\n');
    
    try {
      // Step 1: Login
      setResult(prev => prev + 'Step 1: Logging in...\n');
      await login('test@example.com', 'password123');
      setResult(prev => prev + '✅ Login successful\n');
      
      // Step 2: Check state
      setResult(prev => prev + 'Step 2: Checking auth state...\n');
      setResult(prev => prev + `- Authenticated: ${isAuthenticated}\n`);
      setResult(prev => prev + `- Token: ${token ? 'EXISTS' : 'MISSING'}\n`);
      setResult(prev => prev + `- User: ${user?.name || 'NONE'}\n`);
      
      // Step 3: Test API call
      setResult(prev => prev + 'Step 3: Testing API call...\n');
      const documents = await documentService.getDocuments();
      setResult(prev => prev + `✅ API call successful - Found ${documents.documents.length} documents\n`);
      
      // Step 4: Test upload
      setResult(prev => prev + 'Step 4: Testing document upload...\n');
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const uploadData = {
        title: 'Test Document',
        category: 'other' as any,
        isPublic: true,
        status: 'pending' as any,
        ownerId: '',
        filename: 'test.txt',
        originalFilename: 'test.txt',
        s3Key: '',
        s3Bucket: '',
        type: 'txt' as any,
        metadata: {
          size: testFile.size,
          mimeType: testFile.type,
          tags: ['test'],
          ocrUsed: false,
        },
        permissions: {
          isPublic: true,
          allowedUsers: [],
          allowedRoles: [],
        },
      };
      
      await documentService.uploadDocument(testFile, uploadData);
      setResult(prev => prev + '✅ Document upload successful\n');
      
      setResult(prev => prev + '\n🎉 ALL TESTS PASSED! Authentication is working correctly.\n');
      
    } catch (error: any) {
      setResult(prev => prev + `❌ ERROR: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    try {
      await logout();
      setResult('✅ Logout successful - Auth state cleared');
    } catch (error: any) {
      setResult(`❌ Logout failed: ${error.message}`);
    }
  };

  const checkCurrentState = () => {
    setResult(`Current Auth State:
- Authenticated: ${isAuthenticated}
- Token: ${token ? 'EXISTS' : 'MISSING'}
- User: ${user?.name || 'NONE'}
- Token Length: ${token?.length || 0}
- Token Preview: ${token ? token.substring(0, 20) + '...' : 'NONE'}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Final Authentication Test</CardTitle>
        <CardDescription>
          Complete end-to-end authentication and API testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={testCompleteFlow} 
            loading={loading} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            Test Complete Flow
          </Button>
          <Button onClick={checkCurrentState} size="sm" variant="outline">
            Check Current State
          </Button>
          <Button onClick={testLogout} size="sm" variant="outline">
            Test Logout
          </Button>
        </div>

        {result && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <pre className="text-sm font-mono whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p><strong>Test Steps:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Click "Test Complete Flow" to run all tests</li>
            <li>Should show login, API call, and upload success</li>
            <li>If all pass, authentication is fully working</li>
            <li>If any fail, check console for detailed logs</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
