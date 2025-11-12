import { create } from 'zustand';

interface SpotifyStatusState {
  isSpotifyApiAvailable: boolean;
  lastUpdated: number | null;
  setSpotifyApiAvailability: (available: boolean) => void;
  setLastUpdated: (timestamp: number) => void;
}

export const useSpotifyStatusStore = create<SpotifyStatusState>((set) => ({
  isSpotifyApiAvailable: true, // Assume available initially
  lastUpdated: null,
  setSpotifyApiAvailability: (available: boolean) => set({ isSpotifyApiAvailable: available }),
  setLastUpdated: (timestamp: number) => set({ lastUpdated: timestamp }),
}));
