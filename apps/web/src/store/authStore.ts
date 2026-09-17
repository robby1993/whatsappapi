import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  number: string;
  name: string;
  userType: 'admin' | 'user';
  isActive: boolean;
  validDays?: number;
  gender?: string;
  subscriptionExpiry?: string;
  allowWebBaileys?: boolean;
  allowWaba?: boolean;
  allowRcs?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  initialized: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  init: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  initialized: false,
  setAuth: (user, token) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    set({ user, token, initialized: true });
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    set({ user: null, token: null, initialized: true });
  },
  refreshUser: async () => {
    try {
      const res = await api.get('/users/dashboard');
      const freshUser = res.data?.result?.user || res.data?.result?.profile;
      if (res.data?.status && freshUser) {
        localStorage.setItem('user_data', JSON.stringify(freshUser));
        set({ user: freshUser });
      }
    } catch (err) {
      // Ignore refresh errors
    }
  },
  init: async () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        set({ user: parsedUser, token, initialized: true });
        // Fetch fresh user profile in background
        get().refreshUser();
      } catch (e) {
        set({ user: null, token: null, initialized: true });
      }
    } else {
      set({ initialized: true });
    }
  },
}));
