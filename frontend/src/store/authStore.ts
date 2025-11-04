import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState, RegisterData } from '../types';
import api from '../services/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await api.login(email, password);
          const { user, token } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Login failed');
        }
      },

      register: async (data: RegisterData) => {
        try {
          const response = await api.register(data);
          const { user, token } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Registration failed');
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
