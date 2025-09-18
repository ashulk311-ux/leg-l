import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CpuChipIcon,
  CogIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/auth';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuthStore();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
    { name: 'AI Features', href: '/ai', icon: CpuChipIcon },
    ...(isAdmin() ? [{ name: 'Admin', href: '/admin', icon: CogIcon }] : []),
  ];

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
          
          {/* Mobile menu panel */}
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">LegalDocs</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* User info */}
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4">
              <Link
                to="/profile"
                onClick={onClose}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <UserIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
