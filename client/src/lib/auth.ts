import { create } from 'zustand';
import { apiRequest } from './queryClient';
import { User } from './types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isVisitor: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  continueAsVisitor: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isVisitor: false,
  isLoading: true,
  error: null,
  login: async (username: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed. Please check your credentials.');
      }

      const user = await response.json();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // ... existing code ... <rest of the auth state methods>
}));
