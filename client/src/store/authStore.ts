import { create } from 'zustand';

export interface User {
  id: number;
  firstName: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (mockUser?: User) => void;
  logout: () => void;
}

// Sandbox defaults to Joe as Admin
const defaultMockUser: User = {
  id: 1,
  firstName: 'Joe',
  email: 'joe@me-commerce.local',
  isAdmin: true
};

export const useAuthStore = create<AuthState>((set) => ({
  user: defaultMockUser,
  isAuthenticated: true,
  login: (mockUser) => set({ user: mockUser || defaultMockUser, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
