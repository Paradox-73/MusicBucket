import { create } from 'zustand';
import type { SpotifyProfile } from '../../types/Culture_Clash/spotify';

interface AuthState {
  isAuthenticated: boolean;
  profile: SpotifyProfile | null;
  setProfile: (profile: SpotifyProfile | null) => void;
  setIsAuthenticated: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  profile: null,
  setProfile: (profile) => set({ profile }),
  setIsAuthenticated: (status) => set({ isAuthenticated: status }),
}));