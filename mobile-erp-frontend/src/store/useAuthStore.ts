import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
  comId: number | null;
  branchId: number | null;
  isShowCosting: boolean;
  canSeeOthersEntry: boolean;
  subscriptionExpiryDate?: string;
  isNearExpiry?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'mobile-erp-auth',
    }
  )
);
