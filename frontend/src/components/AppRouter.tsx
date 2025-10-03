import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { LoadingSpinner } from './ui/LoadingSpinner';
import Layout from './Layout';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';

const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const DocumentsPage = lazy(() => import('../pages/DocumentsPage'));
const DocumentViewerPage = lazy(() => import('../pages/DocumentViewerPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const UploadPage = lazy(() => import('../pages/UploadPage'));
const AIPage = lazy(() => import('../pages/AIPage')); // Hidden but kept for future use
const AdminPage = lazy(() => import('../pages/AdminPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const TestAuth = lazy(() => import('../pages/TestAuth'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Protected Route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Public Route component (redirects to dashboard if authenticated)
interface PublicRouteProps {
  children: React.ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Loading component for Suspense
function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Layout>
                <LoginPage />
              </Layout>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Layout>
                <RegisterPage />
              </Layout>
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Layout>
                <DocumentsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <DocumentViewerPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Layout>
                <SearchPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Layout>
                <UploadPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* AI Features - Hidden but kept for future use */}
        <Route
          path="/ai"
          element={
            <ProtectedRoute>
              <Layout>
                <AIPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <AdminPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Test route */}
        <Route
          path="/test-auth"
          element={
            <Layout>
              <TestAuth />
            </Layout>
          }
        />

        {/* Catch all route */}
        <Route 
          path="*" 
          element={
            <Layout>
              <NotFoundPage />
            </Layout>
          } 
        />
      </Routes>
    </Suspense>
  );
}
