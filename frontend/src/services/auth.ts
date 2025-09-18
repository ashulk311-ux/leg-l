import { apiService } from './api';
import { User, UserRole, LoginDto, RegisterDto, AuthResponse } from '@shared/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService {
  private authState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  };

  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    const token = apiService.getToken();
    if (token) {
      this.authState.token = token;
      this.authState.isAuthenticated = true;
      this.loadUserProfile();
    } else {
      this.authState.isLoading = false;
      this.notifyListeners();
    }
  }

  private async loadUserProfile() {
    try {
      const user = await apiService.get<User>('/auth/profile');
      this.authState.user = user;
      this.authState.isAuthenticated = true;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      this.logout();
    } finally {
      this.authState.isLoading = false;
      this.notifyListeners();
    }
  }

  public async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      this.authState.isLoading = true;
      this.notifyListeners();

      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      
      this.authState.token = response.accessToken;
      this.authState.user = response.user;
      this.authState.isAuthenticated = true;
      this.authState.isLoading = false;

      apiService.setToken(response.accessToken);
      this.notifyListeners();

      return response;
    } catch (error) {
      this.authState.isLoading = false;
      this.notifyListeners();
      throw error;
    }
  }

  public async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      this.authState.isLoading = true;
      this.notifyListeners();

      const response = await apiService.post<AuthResponse>('/auth/register', userData);
      
      this.authState.token = response.accessToken;
      this.authState.user = response.user;
      this.authState.isAuthenticated = true;
      this.authState.isLoading = false;

      apiService.setToken(response.accessToken);
      this.notifyListeners();

      return response;
    } catch (error) {
      this.authState.isLoading = false;
      this.notifyListeners();
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.authState.user = null;
      this.authState.token = null;
      this.authState.isAuthenticated = false;
      this.authState.isLoading = false;

      apiService.clearToken();
      this.notifyListeners();
    }
  }

  public async refreshToken(): Promise<string> {
    try {
      const response = await apiService.post<{ accessToken: string }>('/auth/refresh');
      this.authState.token = response.accessToken;
      apiService.setToken(response.accessToken);
      this.notifyListeners();
      return response.accessToken;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  public async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const updatedUser = await apiService.patch<User>('/auth/profile', userData);
      this.authState.user = updatedUser;
      this.notifyListeners();
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiService.patch('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw error;
    }
  }

  public async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiService.post('/auth/forgot-password', { email });
    } catch (error) {
      throw error;
    }
  }

  public async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiService.post('/auth/reset-password', {
        token,
        newPassword,
      });
    } catch (error) {
      throw error;
    }
  }

  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  public getUser(): User | null {
    return this.authState.user;
  }

  public getToken(): string | null {
    return this.authState.token;
  }

  public hasRole(role: UserRole): boolean {
    return this.authState.user?.role === role;
  }

  public isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  public isUser(): boolean {
    return this.hasRole(UserRole.USER);
  }

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.authState }));
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export types
export type { LoginRequest, RegisterRequest, AuthState };
