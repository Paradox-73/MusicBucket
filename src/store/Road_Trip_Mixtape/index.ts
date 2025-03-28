import { create } from 'zustand';
import { Location, Route, Track, Artist } from '../../types/Road_Trip_Mixtape';

interface AppState {
  startLocation: Location | null;
  endLocation: Location | null;
  selectedGenres: string[];
  route: Route | null;
  playlist: Track[];
  artists: Artist[];
  isLoading: boolean;
  error: string | null;
  playlistName: string;
  playlistDescription: string;
  isPublic: boolean;
  setPlaylistName: (name: string) => void;
  setPlaylistDescription: (description: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  reorderTracks: (fromIndex: number, toIndex: number) => void;
  setStartLocation: (location: Location) => void;
  setEndLocation: (location: Location) => void;
  setSelectedGenres: (genres: string[]) => void;
  setRoute: (route: Route) => void;
  setPlaylist: (playlist: Track[]) => void;
  setArtists: (artists: Artist[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  startLocation: null,
  endLocation: null,
  selectedGenres: [],
  route: null,
  playlist: [],
  artists: [],
  isLoading: false,
  error: null,
  playlistName: '',
  playlistDescription: '',
  isPublic: false,
  setStartLocation: (location) => set({ startLocation: location }),
  setEndLocation: (location) => set({ endLocation: location }),
  setSelectedGenres: (genres) => set({ selectedGenres: genres }),
  setRoute: (route) => set({ route }),
  setPlaylist: (playlist) => set({ playlist }),
  setArtists: (artists) => set({ artists }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPlaylistName: (name) => set({ playlistName: name }),
  setPlaylistDescription: (description) => set({ playlistDescription: description }),
  setIsPublic: (isPublic) => set({ isPublic }),
  reorderTracks: (fromIndex, toIndex) => set((state) => {
    const newPlaylist = [...state.playlist];
    const [removed] = newPlaylist.splice(fromIndex, 1);
    newPlaylist.splice(toIndex, 0, removed);
    return { playlist: newPlaylist };
  }),
}));