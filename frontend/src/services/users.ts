import { apiService } from './api';
import { UserRole } from '@shared/types';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: UserRole;
  status?: 'active' | 'inactive' | 'suspended';
  isActive?: boolean;
}

export const usersService = {
  async getUsers(): Promise<User[]> {
    return apiService.get<User[]>('/users');
  },

  async getUserById(userId: string): Promise<User> {
    return apiService.get<User>(`/users/${userId}`);
  },

  async createUser(userData: CreateUserData): Promise<User> {
    return apiService.post<User>('/users', userData);
  },

  async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
    return apiService.put<User>(`/users/${userId}`, userData);
  },

  async deleteUser(userId: string): Promise<void> {
    return apiService.delete(`/users/${userId}`);
  },

  async suspendUser(userId: string): Promise<User> {
    return apiService.post<User>(`/users/${userId}/suspend`);
  },

  async activateUser(userId: string): Promise<User> {
    return apiService.post<User>(`/users/${userId}/activate`);
  }
};
