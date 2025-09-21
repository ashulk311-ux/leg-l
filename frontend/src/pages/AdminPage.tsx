import { useState } from 'react';
import { UserManagement } from '../components/admin/UserManagement';
import { SystemAnalytics } from '../components/admin/SystemAnalytics';
import { SystemConfiguration } from '../components/admin/SystemConfiguration';

function AdminPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'config'>('analytics');

  const tabs = [
    { id: 'analytics', label: 'Analytics', description: 'System performance and usage' },
    { id: 'users', label: 'User Management', description: 'Manage users and permissions' },
    { id: 'config', label: 'Configuration', description: 'System settings and preferences' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System management and configuration</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'analytics' && <SystemAnalytics />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'config' && <SystemConfiguration />}
      </div>
    </div>
  );
}

export default AdminPage;
