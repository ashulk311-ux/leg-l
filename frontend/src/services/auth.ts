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
    console.log('Auth Service: Initializing auth...');
    const token = apiService.getToken();
    console.log('Auth Service: API service token:', token ? 'EXISTS' : 'MISSING');
    
    if (token) {
      this.authState.token = token;
      this.authState.isAuthenticated = true;
      console.log('Auth Service: Token found, loading user profile...');
      this.loadUserProfile();
    } else {
      console.log('Auth Service: No token found, setting loading to false');
      this.authState.isLoading = false;
      this.notifyListeners();
    }
  }

  public setToken(token: string) {
    console.log('Auth Service: setToken called with:', {
      token: token ? 'EXISTS' : 'MISSING',
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'NONE'
    });
    
    if (!token || token.trim() === '') {
      console.log('Auth Service: ERROR - Empty or null token provided!');
      return;
    }
    
    this.authState.token = token;
    this.authState.isAuthenticated = true;
    apiService.setToken(token);
    this.notifyListeners();
    console.log('Auth Service: Token set successfully');
  }

  public clearToken() {
    this.authState.token = null;
    this.authState.isAuthenticated = false;
    this.authState.user = null;
    apiService.clearToken();
    this.notifyListeners();
  }

  private async loadUserProfile() {
    try {
      const user = await apiService.get<User>('/auth/me');
      this.authState.user = user;
      this.authState.isAuthenticated = true;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Clear auth state without calling logout API
      this.authState.user = null;
      this.authState.token = null;
      this.authState.isAuthenticated = false;
      apiService.clearToken();
    } finally {
      this.authState.isLoading = false;
      this.notifyListeners();
    }
  }

  public async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      this.authState.isLoading = true;
      this.notifyListeners();

      console.log('Auth Service: Starting login with credentials:', { email: credentials.email });
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      console.log('Auth Service: Login response received:', {
        hasUser: !!response.user,
        hasAccessToken: !!response.accessToken,
        hasData: !!response.data,
        hasDataAccessToken: !!response.data?.accessToken,
        tokenLength: response.accessToken?.length || 0,
        dataTokenLength: response.data?.accessToken?.length || 0,
        tokenPreview: response.accessToken ? response.accessToken.substring(0, 20) + '...' : 'NONE',
        dataTokenPreview: response.data?.accessToken ? response.data.accessToken.substring(0, 20) + '...' : 'NONE'
      });
      
      // Extract token from the correct location
      const accessToken = response.accessToken || response.data?.accessToken;
      const user = response.user || response.data?.user;
      
      this.authState.user = user;
      this.authState.isLoading = false;
      
      if (accessToken) {
        console.log('Auth Service: Setting token from response');
        this.setToken(accessToken);
      } else {
        console.log('Auth Service: ERROR - No access token in response!');
        throw new Error('No access token received from server');
      }

      return response;
    } catch (error) {
      console.log('Auth Service: Login failed:', error);
      this.authState.isLoading = false;
      this.notifyListeners();
      throw error;
    }
  }

  public async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      this.authState.isLoading = true;
      this.notifyListeners();

      console.log('Auth Service: Starting register with userData:', { email: userData.email });
      const response = await apiService.post<AuthResponse>('/auth/register', userData);
      console.log('Auth Service: Register response received:', {
        hasUser: !!response.user,
        hasAccessToken: !!response.accessToken,
        hasData: !!response.data,
        hasDataAccessToken: !!response.data?.accessToken,
        tokenLength: response.accessToken?.length || 0,
        dataTokenLength: response.data?.accessToken?.length || 0
      });
      
      // Extract token from the correct location
      const accessToken = response.accessToken || response.data?.accessToken;
      const user = response.user || response.data?.user;
      
      this.authState.user = user;
      this.authState.isLoading = false;
      
      if (accessToken) {
        console.log('Auth Service: Setting token from register response');
        this.setToken(accessToken);
      } else {
        console.log('Auth Service: ERROR - No access token in register response!');
        throw new Error('No access token received from server');
      }

      return response;
    } catch (error) {
      console.log('Auth Service: Register failed:', error);
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
      this.clearToken();
      this.authState.isLoading = false;
    }
  }

  public async refreshToken(): Promise<string> {
    try {
      const response = await apiService.post<{ accessToken: string }>('/auth/refresh');
      this.setToken(response.accessToken);
      return response.accessToken;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  public async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const updatedUser = await apiService.patch<User>('/auth/me', userData);
      this.authState.user = updatedUser;
      this.notifyListeners();
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiService.patch('/users/me/password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw error;
    }
  }

  public async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiService.post('/auth/password-reset', { email });
    } catch (error) {
      throw error;
    }
  }

  public async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiService.post('/auth/password-reset/confirm', {
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
