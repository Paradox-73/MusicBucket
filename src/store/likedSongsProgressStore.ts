import { create } from 'zustand';

interface LikedSongsProgressState {
  progress: number; // 0-100
  isLoading: boolean;
  error: string | null;
  startLoading: () => void;
  updateProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useLikedSongsProgressStore = create<LikedSongsProgressState>((set) => ({
  progress: 0,
  isLoading: false,
  error: null,
  startLoading: () => {
    console.log('Zustand: startLoading - Setting isLoading to true, progress to 0');
    set({ isLoading: true, progress: 0, error: null });
  },
  updateProgress: (progress) => {
    console.log(`Zustand: updateProgress - Setting progress to ${progress}`);
    set({ progress });
  },
  setError: (error) => {
    console.log(`Zustand: setError - Setting error: ${error}, isLoading to false`);
    set({ error, isLoading: false });
  },
  reset: () => {
    console.log('Zustand: reset - Setting progress to 0, isLoading to false, error to null');
    set({ progress: 0, isLoading: false, error: null });
  },
}));