import { useState, useCallback } from 'react';
import { SpotifyAPI } from '../../lib/Bucket_List/spotify/api';
import type { SpotifyItem } from '../../types/Bucket_List/spotify';

export function useSpotifySearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, types: string[] = ['artist', 'album', 'track', 'playlist']): Promise<SpotifyItem[]> => {
    if (!query.trim()) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const api = SpotifyAPI.getInstance();
      const results = await api.search(query, types);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { search, isLoading, error };
}