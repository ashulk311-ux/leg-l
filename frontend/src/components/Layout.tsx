import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();

  // Don't show header/footer on landing page
  if (location.pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container">
          <div className="flex justify-between items-center" style={{ height: '4rem' }}>
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚖️</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                LegalDocs
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/documents" 
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Documents
              </Link>
              <Link 
                to="/search" 
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Search
              </Link>
              <Link 
                to="/ai" 
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                AI Tools
              </Link>
              {isAuthenticated && user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium hidden sm:block">
                      {user?.name || 'User'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link 
                      to="/profile" 
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={logout}
                      className="text-gray-600 hover:text-red-600 font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/login" 
                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⚖️</span>
                </div>
                <span className="text-xl font-bold text-white">
                  LegalDocs
                </span>
              </div>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                AI-powered legal document management for modern professionals. 
                Streamline your workflow with intelligent automation.
              </p>
              
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span className="text-white">📧</span>
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span className="text-white">🐦</span>
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span className="text-white">💼</span>
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
              <div className="space-y-3">
                <Link to="/features" className="block text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
                <Link to="/pricing" className="block text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link to="/security" className="block text-gray-400 hover:text-white transition-colors">
                  Security
                </Link>
                <Link to="/integrations" className="block text-gray-400 hover:text-white transition-colors">
                  Integrations
                </Link>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
              <div className="space-y-3">
                <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
                <Link to="/careers" className="block text-gray-400 hover:text-white transition-colors">
                  Careers
                </Link>
                <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
                <Link to="/blog" className="block text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">
                © 2024 LegalDocs. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
