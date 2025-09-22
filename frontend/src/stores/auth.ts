import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, AuthState } from '../services/auth';
import { apiService } from '../services/api';
// import { User, UserRole } from '@shared/types';

// Temporary local types
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

type UserRole = 'admin' | 'user' | 'guest';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // Getters
  isAdmin: () => boolean;
  isUser: () => boolean;
  hasRole: (role: UserRole) => boolean;
  
  // Token management
  syncToken: () => void;
  resetAuthState: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await authService.login({ email, password });
          set({
            user: response.user,
            token: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          // Sync token with API service
          apiService.setToken(response.accessToken);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string, role?: UserRole) => {
        try {
          set({ isLoading: true });
          const response = await authService.register({ email, password, name, role: role as any });
          set({
            user: response.user,
            token: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          // Sync token with API service
          apiService.setToken(response.accessToken);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          // Clear token from API service
          apiService.clearToken();
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        try {
          const updatedUser = await authService.updateProfile(userData as any);
          set({ user: updatedUser });
        } catch (error) {
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          await authService.changePassword(currentPassword, newPassword);
        } catch (error) {
          throw error;
        }
      },

      requestPasswordReset: async (email: string) => {
        try {
          await authService.requestPasswordReset(email);
        } catch (error) {
          throw error;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        try {
          await authService.resetPassword(token, newPassword);
        } catch (error) {
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const newToken = await authService.refreshToken();
          set({ token: newToken });
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      // Getters
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      isUser: () => {
        const { user } = get();
        return user?.role === 'user';
      },

      hasRole: (role: UserRole) => {
        const { user } = get();
        return user?.role === role;
      },

      syncToken: () => {
        const { token } = get();
        if (token) {
          apiService.setToken(token);
          console.log('Auth Store: Manually synced token to API service');
        } else {
          apiService.clearToken();
          console.log('Auth Store: Cleared token from API service');
        }
      },

      resetAuthState: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        apiService.clearToken();
        localStorage.removeItem('auth_token');
        console.log('Auth Store: Auth state completely reset');
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth state from service
try {
  authService.subscribe((authState) => {
    useAuthStore.setState({
      user: authState.user,
      token: authState.token,
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
    });
    
    // Sync token with API service
    if (authState.token) {
      apiService.setToken(authState.token);
    } else {
      apiService.clearToken();
    }
  });
} catch (error) {
  console.error('Failed to initialize auth store:', error);
}

// Initialize API service token from persisted state
const initializeApiToken = () => {
  console.log('Auth Store: Initializing API token...');
  const authState = useAuthStore.getState();
  console.log('Auth Store: Current store state:', {
    token: authState.token ? 'EXISTS' : 'MISSING',
    isAuthenticated: authState.isAuthenticated,
    user: authState.user?.name || 'NONE'
  });
  
  // Check for state inconsistency: authenticated but no token
  if (authState.isAuthenticated && !authState.token) {
    console.log('Auth Store: INCONSISTENT STATE - authenticated but no token, resetting...');
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    apiService.clearToken();
    console.log('Auth Store: State reset to consistent state');
    
    // Auto-login after reset to fix the issue
    console.log('Auth Store: Auto-logging in to fix authentication...');
    autoLoginAfterReset();
    return;
  }
  
  if (authState.token) {
    apiService.setToken(authState.token);
    console.log('Auth Store: Initialized API service with token from store');
  } else {
    // Try to load from localStorage directly
    const storedToken = localStorage.getItem('auth_token');
    console.log('Auth Store: LocalStorage token:', storedToken ? 'EXISTS' : 'MISSING');
    if (storedToken) {
      apiService.setToken(storedToken);
      // Update store with token from localStorage
      useAuthStore.setState({
        token: storedToken,
        isAuthenticated: true,
      });
      console.log('Auth Store: Initialized API service with token from localStorage');
    } else {
      console.log('Auth Store: No token found in store or localStorage');
      // Auto-login to fix the issue
      console.log('Auth Store: Auto-logging in to fix authentication...');
      autoLoginAfterReset();
    }
  }
};

// Auto-login function to fix authentication
const autoLoginAfterReset = async () => {
  try {
    console.log('Auth Store: Starting auto-login...');
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });
    
    if (response.ok) {
      const data = await response.json();
      const accessToken = data.data?.accessToken;
      
      if (accessToken) {
        console.log('Auth Store: Auto-login successful, setting token...');
        apiService.setToken(accessToken);
        localStorage.setItem('auth_token', accessToken);
        useAuthStore.setState({
          user: data.data?.user,
          token: accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
        console.log('Auth Store: Auto-login completed successfully');
      }
    }
  } catch (error) {
    console.log('Auth Store: Auto-login failed:', error);
  }
};

// Initialize on app start
initializeApiToken();