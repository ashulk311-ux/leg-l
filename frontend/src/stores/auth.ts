import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, AuthState } from '../services/auth';
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
  });
} catch (error) {
  console.error('Failed to initialize auth store:', error);
}