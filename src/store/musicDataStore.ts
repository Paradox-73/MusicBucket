import { create } from 'zustand';
import { MusicDataState } from '../types/spotify';
import { getAndEnrichAllUserPlaylistTracks } from '../lib/spotify';

export const useMusicDataStore = create<MusicDataState>((set) => ({
  enrichedTracks: [],
  isLoading: false,
  error: null,
  fetchAndEnrichMusicData: async () => {
    set({ isLoading: true, error: null });
    try {
      const tracks = await getAndEnrichAllUserPlaylistTracks();
      set({ enrichedTracks: tracks, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch and enrich music data:', error);
      set({ error: 'Failed to load music data.', isLoading: false });
    }
  },
}));
