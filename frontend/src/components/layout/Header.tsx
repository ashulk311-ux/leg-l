import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bars3Icon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/auth';
import { MobileNavigation } from './MobileNavigation';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuthStore();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Documents', href: '/documents' },
    { name: 'Search', href: '/search' },
    { name: 'AI Features', href: '/ai' },
    ...(isAdmin() ? [{ name: 'Admin', href: '/admin' }] : []),
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and mobile menu button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              
              <Link to="/dashboard" className="flex items-center space-x-2 ml-2 lg:ml-0">
                <DocumentTextIcon className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900 hidden sm:block">LegalDocs</span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex lg:space-x-8">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Search button for mobile */}
              <Link
                to="/search"
                className="lg:hidden rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </Link>

              {/* Notifications */}
              <button className="hidden sm:block rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <BellIcon className="h-5 w-5" />
              </button>

              {/* User menu */}
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="hidden sm:block rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
