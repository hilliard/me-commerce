import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: any | null;
  setAuth: (token: string, user: any) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Sync initially directly out of temporal browser storage
  const storedToken = localStorage.getItem('__mec_auth_token');
  const storedUser = localStorage.getItem('__mec_auth_user');

  return {
    token: storedToken ? storedToken : null,
    user: storedUser ? JSON.parse(storedUser) : null,
    setAuth: (token, user) => {
      localStorage.setItem('__mec_auth_token', token);
      localStorage.setItem('__mec_auth_user', JSON.stringify(user));
      set({ token, user });
    },
    clearAuth: () => {
      localStorage.removeItem('__mec_auth_token');
      localStorage.removeItem('__mec_auth_user');
      set({ token: null, user: null });
    }
  };
});
