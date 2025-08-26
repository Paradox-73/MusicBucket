import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  clearTokens: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      setTokens: (accessToken, refreshToken, expiresIn) => {
        const expiresAt = Date.now() + expiresIn * 1000;
        set({ accessToken, refreshToken, expiresAt });
      },
      clearTokens: () => {
        set({ accessToken: null, refreshToken: null, expiresAt: null });
      },
      isAuthenticated: () => {
        const state = get();
        return !!(
          state.accessToken &&
          state.expiresAt &&
          state.expiresAt > Date.now()
        );
      },
    }),
    {
      name: 'spotify-auth',
    }
  )
);