import { apiService } from './api';

export interface SystemStats {
  totalUsers: number;
  totalDocuments: number;
  totalStorage: number;
  activeUsers: number;
  processingJobs: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export interface SystemConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  storageLimit: number;
  enableOCR: boolean;
  enableVectorSearch: boolean;
  enableLLMSummarization: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
}

export const adminService = {
  async getSystemStats(): Promise<SystemStats> {
    return apiService.get<SystemStats>('/admin/stats');
  },

  async getSystemConfig(): Promise<SystemConfig> {
    return apiService.get<SystemConfig>('/admin/config');
  },

  async updateSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
    return apiService.put<SystemConfig>('/admin/config', config);
  },

  async updateSystemConfiguration(config: Partial<SystemConfig>): Promise<SystemConfig> {
    return apiService.put<SystemConfig>('/admin/config', config);
  },

  async getSystemAnalytics(): Promise<any> {
    return apiService.get<any>('/admin/analytics');
  },

  async getUsers(): Promise<User[]> {
    return apiService.get<User[]>('/admin/users');
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    return apiService.put<User>(`/admin/users/${userId}`, userData);
  },

  async deleteUser(userId: string): Promise<void> {
    return apiService.delete(`/admin/users/${userId}`);
  },

  async suspendUser(userId: string): Promise<User> {
    return apiService.post<User>(`/admin/users/${userId}/suspend`);
  },

  async activateUser(userId: string): Promise<User> {
    return apiService.post<User>(`/admin/users/${userId}/activate`);
  }
};
