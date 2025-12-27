import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, AuthUser, LoginRequest, RegisterRequest } from '../services/api';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(data);
          
          if (response.data.success && response.data.data) {
            const { token, user } = response.data.data;
            
            // Save token to localStorage for axios interceptor
            localStorage.setItem('token', token);
            
            set({
              user,
              token,
              isLoading: false,
              error: null,
            });
            
            return true;
          }
          
          set({
            isLoading: false,
            error: response.data.error || 'Đăng nhập thất bại',
          });
          return false;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Đăng nhập thất bại';
          set({ isLoading: false, error: message });
          return false;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          
          if (response.data.success && response.data.data) {
            const { token, user } = response.data.data;
            
            localStorage.setItem('token', token);
            
            set({
              user,
              token,
              isLoading: false,
              error: null,
            });
            
            return true;
          }
          
          set({
            isLoading: false,
            error: response.data.error || 'Đăng ký thất bại',
          });
          return false;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Đăng ký thất bại';
          set({ isLoading: false, error: message });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, error: null });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        const token = get().token || localStorage.getItem('token');
        
        if (!token) {
          set({ user: null, token: null });
          return false;
        }

        try {
          const response = await authApi.getMe();
          
          if (response.data.success && response.data.data) {
            set({ user: response.data.data as AuthUser, token });
            return true;
          }
          
          // Token invalid
          localStorage.removeItem('token');
          set({ user: null, token: null });
          return false;
        } catch {
          localStorage.removeItem('token');
          set({ user: null, token: null });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;



