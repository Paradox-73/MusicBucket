import { create } from 'zustand';
import { UITrack } from '../../components/common/trackTypes';
import { PMArtist, PoolFilters, DEFAULT_POOL_FILTERS, PoolResult } from '../../services/Playlist_Manager/buildPool';

interface PlaylistManagerState {
  seedArtists: PMArtist[];
  seedGenres: string[];
  filters: PoolFilters;

  pool: UITrack[];
  reserve: UITrack[];
  targetSize: number;
  artistCount: number;
  hasBuilt: boolean;
  audioUnavailable: boolean;

  name: string;
  isPublic: boolean;

  addSeedArtist: (artist: PMArtist) => void;
  removeSeedArtist: (id: string) => void;
  addSeedGenre: (genre: string) => void;
  removeSeedGenre: (genre: string) => void;
  updateFilter: <K extends keyof PoolFilters>(key: K, value: PoolFilters[K]) => void;
  toggleGenreFilter: (genre: string) => void;

  setPoolResult: (result: PoolResult) => void;
  moveTrack: (index: number, dir: -1 | 1) => void;
  removeTrack: (id: string) => void;

  setName: (name: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  reset: () => void;
}

/**
 * Persists the Playlist Manager's seeds, filters and built pool outside the
 * React tree so the work survives route changes.
 */
export const usePlaylistManagerStore = create<PlaylistManagerState>((set) => ({
  seedArtists: [],
  seedGenres: [],
  filters: DEFAULT_POOL_FILTERS,

  pool: [],
  reserve: [],
  targetSize: 0,
  artistCount: 0,
  hasBuilt: false,
  audioUnavailable: false,

  name: 'My MusicBucket Playlist',
  isPublic: false,

  addSeedArtist: (artist) =>
    set((state) =>
      state.seedArtists.some((s) => s.id === artist.id)
        ? state
        : { seedArtists: [...state.seedArtists, artist] },
    ),

  removeSeedArtist: (id) =>
    set((state) => {
      const seedArtists = state.seedArtists.filter((s) => s.id !== id);
      // Drop genre filters no longer offered by the remaining seeds.
      const stillAvailable = new Set(seedArtists.flatMap((s) => s.genres));
      return {
        seedArtists,
        filters: { ...state.filters, genres: state.filters.genres.filter((g) => stillAvailable.has(g)) },
      };
    }),

  addSeedGenre: (genre) =>
    set((state) => {
      const g = genre.trim().toLowerCase();
      if (!g || state.seedGenres.includes(g)) return state;
      return { seedGenres: [...state.seedGenres, g] };
    }),

  removeSeedGenre: (genre) =>
    set((state) => ({ seedGenres: state.seedGenres.filter((g) => g !== genre) })),

  updateFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),

  toggleGenreFilter: (genre) =>
    set((state) => ({
      filters: {
        ...state.filters,
        genres: state.filters.genres.includes(genre)
          ? state.filters.genres.filter((g) => g !== genre)
          : [...state.filters.genres, genre],
      },
    })),

  setPoolResult: (result) =>
    set({
      pool: result.tracks,
      reserve: result.reserve,
      targetSize: result.targetSize,
      artistCount: result.artistCount,
      audioUnavailable: result.audioUnavailable,
      hasBuilt: true,
    }),

  moveTrack: (index, dir) =>
    set((state) => {
      const next = [...state.pool];
      const target = index + dir;
      if (target < 0 || target >= next.length) return state;
      [next[index], next[target]] = [next[target], next[index]];
      return { pool: next };
    }),

  removeTrack: (id) =>
    set((state) => {
      const pool = state.pool.filter((t) => t.id !== id);
      let reserve = state.reserve;
      // Refill from the reserve to keep the pool at its target size.
      if (pool.length < state.targetSize && reserve.length > 0) {
        const present = new Set(pool.map((t) => t.id));
        const idx = reserve.findIndex((t) => !present.has(t.id));
        if (idx >= 0) {
          pool.push(reserve[idx]);
          reserve = reserve.filter((_, i) => i !== idx);
        }
      }
      return { pool, reserve };
    }),

  setName: (name) => set({ name }),
  setIsPublic: (isPublic) => set({ isPublic }),

  reset: () =>
    set({
      seedArtists: [],
      seedGenres: [],
      filters: DEFAULT_POOL_FILTERS,
      pool: [],
      reserve: [],
      targetSize: 0,
      artistCount: 0,
      hasBuilt: false,
      audioUnavailable: false,
      name: 'My MusicBucket Playlist',
      isPublic: false,
    }),
}));
