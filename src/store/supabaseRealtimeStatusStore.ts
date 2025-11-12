import { create } from 'zustand';

interface SupabaseRealtimeStatusState {
  isSupabaseRealtimeOnline: boolean;
  setSupabaseRealtimeOnline: (online: boolean) => void;
}

export const useSupabaseRealtimeStatusStore = create<SupabaseRealtimeStatusState>((set) => ({
  isSupabaseRealtimeOnline: true, // Assume online initially
  setSupabaseRealtimeOnline: (online: boolean) => set({ isSupabaseRealtimeOnline: online }),
}));
