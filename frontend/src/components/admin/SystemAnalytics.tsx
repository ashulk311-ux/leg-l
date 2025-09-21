import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChartBarIcon,
  DocumentTextIcon,
  UserIcon,
  CpuChipIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { adminService } from '../../services/admin';

interface SystemAnalyticsProps {
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export function SystemAnalytics({ timeRange: initialTimeRange = '30d' }: SystemAnalyticsProps) {
  const [timeRange, setTimeRange] = useState(initialTimeRange);

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['admin-analytics', timeRange],
    queryFn: () => adminService.getSystemAnalytics(),
  });

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load analytics</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Analytics</h2>
          <p className="text-gray-600 mt-1">Monitor system performance and usage</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Time range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {isLoading ? '...' : analytics?.users?.total || 0}
                  </p>
                  {analytics?.users?.change && (
                    <div className={`ml-2 flex items-center text-sm ${getChangeColor(analytics.users.change)}`}>
                      {getChangeIcon(analytics.users.change)}
                      <span className="ml-1">{Math.abs(analytics.users.change)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Documents */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {isLoading ? '...' : analytics?.documents?.total || 0}
                  </p>
                  {analytics?.documents?.change && (
                    <div className={`ml-2 flex items-center text-sm ${getChangeColor(analytics.documents.change)}`}>
                      {getChangeIcon(analytics.documents.change)}
                      <span className="ml-1">{Math.abs(analytics.documents.change)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Requests */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CpuChipIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">AI Requests</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {isLoading ? '...' : analytics?.aiRequests?.total || 0}
                  </p>
                  {analytics?.aiRequests?.change && (
                    <div className={`ml-2 flex items-center text-sm ${getChangeColor(analytics.aiRequests.change)}`}>
                      {getChangeIcon(analytics.aiRequests.change)}
                      <span className="ml-1">{Math.abs(analytics.aiRequests.change)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Used */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {isLoading ? '...' : `${analytics?.storage?.used || 0} GB`}
                  </p>
                  <p className="ml-2 text-sm text-gray-500">
                    / {analytics?.storage?.total || 0} GB
                  </p>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${((analytics?.storage?.used || 0) / (analytics?.storage?.total || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>User engagement and activity metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="font-semibold">{analytics?.userActivity?.activeUsers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Registrations</span>
                  <span className="font-semibold">{analytics?.userActivity?.newRegistrations || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Login Sessions</span>
                  <span className="font-semibold">{analytics?.userActivity?.loginSessions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Session Duration</span>
                  <span className="font-semibold">{analytics?.userActivity?.avgSessionDuration || '0m'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Processing */}
        <Card>
          <CardHeader>
            <CardTitle>Document Processing</CardTitle>
            <CardDescription>Document upload and processing metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Documents Uploaded</span>
                  <span className="font-semibold">{analytics?.documentProcessing?.uploaded || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Processing Queue</span>
                  <span className="font-semibold">{analytics?.documentProcessing?.inQueue || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Successfully Processed</span>
                  <span className="font-semibold">{analytics?.documentProcessing?.processed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Processing Errors</span>
                  <span className="font-semibold text-red-600">{analytics?.documentProcessing?.errors || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>AI Usage Analytics</CardTitle>
          <CardDescription>AI feature usage and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {analytics?.aiUsage?.summarizations || 0}
                </div>
                <div className="text-sm text-gray-600">Document Summarizations</div>
                <div className="text-xs text-gray-500 mt-1">
                  {analytics?.aiUsage?.avgSummarizationTime || '0s'} avg time
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {analytics?.aiUsage?.qaRequests || 0}
                </div>
                <div className="text-sm text-gray-600">Q&A Requests</div>
                <div className="text-xs text-gray-500 mt-1">
                  {analytics?.aiUsage?.avgQATime || '0s'} avg time
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {analytics?.aiUsage?.factMatches || 0}
                </div>
                <div className="text-sm text-gray-600">Fact Matches</div>
                <div className="text-xs text-gray-500 mt-1">
                  {analytics?.aiUsage?.avgFactMatchTime || '0s'} avg time
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Performance */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>System health and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {analytics?.systemPerformance?.uptime || '99.9%'}
                </div>
                <div className="text-sm text-gray-600">System Uptime</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {analytics?.systemPerformance?.avgResponseTime || '0ms'}
                </div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {analytics?.systemPerformance?.cpuUsage || '0%'}
                </div>
                <div className="text-sm text-gray-600">CPU Usage</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {analytics?.systemPerformance?.memoryUsage || '0%'}
                </div>
                <div className="text-sm text-gray-600">Memory Usage</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
