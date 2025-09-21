import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CogIcon,
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { adminService } from '../../services/admin';

export function SystemConfiguration() {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'storage' | 'security'>('general');
  const [isSaving, setIsSaving] = useState(false);

  const queryClient = useQueryClient();

  const updateConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      return await adminService.updateSystemConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-config'] });
      toast.success('Configuration updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update configuration');
    },
  });

  const tabs = [
    { id: 'general', label: 'General', icon: CogIcon },
    { id: 'ai', label: 'AI Settings', icon: CpuChipIcon },
    { id: 'storage', label: 'Storage', icon: CircleStackIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
  ];

  const handleSave = async (config: any) => {
    setIsSaving(true);
    try {
      await updateConfigMutation.mutateAsync(config);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
        <p className="text-gray-600 mt-1">Configure system settings and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ServerIcon className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
              <CardDescription>
                Basic system configuration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="System Name"
                  placeholder="Legal Document Management System"
                  defaultValue="Legal Document Management System"
                />
                <Input
                  label="System Version"
                  placeholder="1.0.0"
                  defaultValue="1.0.0"
                  disabled
                />
                <Input
                  label="Max File Upload Size (MB)"
                  type="number"
                  placeholder="50"
                  defaultValue="50"
                />
                <Input
                  label="Session Timeout (minutes)"
                  type="number"
                  placeholder="60"
                  defaultValue="60"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenance-mode"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-gray-700">
                    Enable maintenance mode
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="user-registration"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="user-registration" className="ml-2 block text-sm text-gray-700">
                    Allow user registration
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email-notifications"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                    Enable email notifications
                  </label>
                </div>
              </div>

              <Button
                onClick={() => handleSave({})}
                loading={isSaving}
                className="w-full sm:w-auto"
              >
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CpuChipIcon className="h-5 w-5" />
                <span>AI Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure AI models and processing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LLM Provider
                  </label>
                  <select className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="local">Local Model</option>
                  </select>
                </div>
                <Input
                  label="LLM Model"
                  placeholder="gpt-4"
                  defaultValue="gpt-4"
                />
                <Input
                  label="Embedding Model"
                  placeholder="text-embedding-ada-002"
                  defaultValue="text-embedding-ada-002"
                />
                <Input
                  label="Max Tokens"
                  type="number"
                  placeholder="4000"
                  defaultValue="4000"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue="0.1"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Conservative (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ai-summarization"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="ai-summarization" className="ml-2 block text-sm text-gray-700">
                    Enable AI summarization
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ai-qa"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="ai-qa" className="ml-2 block text-sm text-gray-700">
                    Enable AI Q&A
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ai-fact-matching"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="ai-fact-matching" className="ml-2 block text-sm text-gray-700">
                    Enable AI fact matching
                  </label>
                </div>
              </div>

              <Button
                onClick={() => handleSave({})}
                loading={isSaving}
                className="w-full sm:w-auto"
              >
                Save AI Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'storage' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CircleStackIcon className="h-5 w-5" />
                <span>Storage Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure document storage and database settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Provider
                  </label>
                  <select className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                    <option value="s3">Amazon S3</option>
                    <option value="minio">MinIO</option>
                    <option value="local">Local Storage</option>
                  </select>
                </div>
                <Input
                  label="Storage Bucket"
                  placeholder="legal-documents"
                  defaultValue="legal-documents"
                />
                <Input
                  label="Max Storage (GB)"
                  type="number"
                  placeholder="1000"
                  defaultValue="1000"
                />
                <Input
                  label="Retention Period (days)"
                  type="number"
                  placeholder="365"
                  defaultValue="365"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto-backup"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="auto-backup" className="ml-2 block text-sm text-gray-700">
                    Enable automatic backups
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="compression"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="compression" className="ml-2 block text-sm text-gray-700">
                    Enable file compression
                  </label>
                </div>
              </div>

              <Button
                onClick={() => handleSave({})}
                loading={isSaving}
                className="w-full sm:w-auto"
              >
                Save Storage Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>
                Configure security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Password Min Length"
                  type="number"
                  placeholder="8"
                  defaultValue="8"
                />
                <Input
                  label="Session Timeout (minutes)"
                  type="number"
                  placeholder="60"
                  defaultValue="60"
                />
                <Input
                  label="Max Login Attempts"
                  type="number"
                  placeholder="5"
                  defaultValue="5"
                />
                <Input
                  label="Lockout Duration (minutes)"
                  type="number"
                  placeholder="15"
                  defaultValue="15"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="two-factor"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="two-factor" className="ml-2 block text-sm text-gray-700">
                    Require two-factor authentication
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="password-complexity"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="password-complexity" className="ml-2 block text-sm text-gray-700">
                    Enforce password complexity
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="audit-logging"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="audit-logging" className="ml-2 block text-sm text-gray-700">
                    Enable audit logging
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Changes to security settings will take effect immediately and may affect all users.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleSave({})}
                loading={isSaving}
                className="w-full sm:w-auto"
              >
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
