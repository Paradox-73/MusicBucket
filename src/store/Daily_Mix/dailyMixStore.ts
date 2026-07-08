import { create } from 'zustand';
import { UITrack } from '../../components/common/trackTypes';
import { DailyMixResult } from '../../services/Daily_Mix/generateDailyMix';

interface DailyMixState {
  /** The current mix shown to the user. */
  tracks: UITrack[];
  /** Extra vetted tracks used to refill the mix after deletions. */
  reserve: UITrack[];
  stats: DailyMixResult['stats'] | null;
  /** Size the mix is kept at when refilling. */
  targetSize: number;
  hasGenerated: boolean;
  /** Whether Last.fm scrobbles powered the current mix. */
  lastfmUsed: boolean;

  setResult: (result: DailyMixResult) => void;
  /** Remove a track; pull a replacement from the reserve to keep the size steady. */
  removeTrack: (id: string) => void;
  reset: () => void;
}

/**
 * Persists the generated Daily Mix outside the React tree so it survives route
 * changes (navigating away and back no longer loses the mix).
 */
export const useDailyMixStore = create<DailyMixState>((set) => ({
  tracks: [],
  reserve: [],
  stats: null,
  targetSize: 0,
  hasGenerated: false,
  lastfmUsed: false,

  setResult: (result) =>
    set({
      tracks: result.tracks,
      reserve: result.reserve,
      stats: result.stats,
      targetSize: result.targetSize,
      hasGenerated: true,
      lastfmUsed: result.lastfmUsed,
    }),

  removeTrack: (id) =>
    set((state) => {
      const tracks = state.tracks.filter((t) => t.id !== id);
      let reserve = state.reserve;

      // Refill from the reserve to maintain the target size, skipping anything
      // already present in the mix.
      if (tracks.length < state.targetSize && reserve.length > 0) {
        const present = new Set(tracks.map((t) => t.id));
        const idx = reserve.findIndex((t) => !present.has(t.id));
        if (idx >= 0) {
          tracks.push(reserve[idx]);
          reserve = reserve.filter((_, i) => i !== idx);
        }
      }

      return { tracks, reserve };
    }),

  reset: () =>
    set({ tracks: [], reserve: [], stats: null, targetSize: 0, hasGenerated: false, lastfmUsed: false }),
}));
