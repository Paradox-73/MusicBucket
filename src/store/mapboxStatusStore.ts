import { create } from 'zustand';

interface MapboxStatusState {
  isMapboxApiAvailable: boolean;
  setMapboxApiAvailability: (available: boolean) => void;
}

export const useMapboxStatusStore = create<MapboxStatusState>((set) => ({
  isMapboxApiAvailable: true, // Assume available initially
  setMapboxApiAvailability: (available: boolean) => set({ isMapboxApiAvailable: available }),
}));
