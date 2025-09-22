import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadToken();
    
    // Set the authorization header if token exists
    if (this.token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      console.log('API Service: Authorization header set on initialization');
    }
    
    // Ensure token is loaded on initialization
    console.log('API Service: Initialized with token:', this.token ? 'Token exists' : 'No token');
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Always try to get the latest token from localStorage
        const latestToken = localStorage.getItem('auth_token');
        if (latestToken && latestToken !== this.token) {
          this.token = latestToken;
          console.log('API Service: Updated token from localStorage');
        }
        
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
          console.log('API Service: Adding Authorization header to request:', config.url);
        } else {
          console.log('API Service: No token available for request:', config.url);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          status: error.response?.status || 500,
          code: error.response?.data?.code,
          details: error.response?.data,
        };

        // Handle specific error cases
        if (apiError.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        } else if (apiError.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else if (apiError.status >= 400) {
          toast.error(apiError.message);
        }

        return Promise.reject(apiError);
      }
    );
  }

  private loadToken() {
    this.token = localStorage.getItem('auth_token');
    console.log('API Service: Loaded token from localStorage:', this.token ? 'Token exists' : 'No token found');
    
    // Set the authorization header if token exists
    if (this.token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      console.log('API Service: Authorization header set on token load');
    }
  }

  public setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
    console.log('API Service: Token set:', token ? 'Token exists' : 'No token');
    
    // Force update the axios instance headers
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('API Service: Authorization header set in axios defaults');
  }

  public clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    
    // Remove the authorization header from axios defaults
    delete this.client.defaults.headers.common['Authorization'];
    console.log('API Service: Authorization header removed from axios defaults');
  }

  public getToken(): string | null {
    return this.token;
  }

  public reloadToken(): void {
    this.loadToken();
    console.log('API Service: Token reloaded:', this.token ? 'Token exists' : 'No token');
  }

  public forceSetToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('API Service: Token force set and header updated');
  }

  // Generic HTTP methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // File upload method
  public async uploadFile<T>(
    url: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await this.client.post<T>(url, formData, config);
    return response.data;
  }

  // Download file method
  public async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export types
export type { ApiResponse, PaginatedResponse, ApiError };
