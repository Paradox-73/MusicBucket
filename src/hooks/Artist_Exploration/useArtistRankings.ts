import { useState, useEffect } from 'react';
import { getTopAndBottomArtists } from '../../lib/Artist_Exploration/spotify/rankings';
import { RankedArtist } from '../../types/Artist_Exploration/artist';

export function useArtistRankings() {
  const [topArtists, setTopArtists] = useState<RankedArtist[]>([]);
  const [bottomArtists, setBottomArtists] = useState<RankedArtist[]>([]);
  const [averageScore, setAverageScore] = useState<string>('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      try {
        const token = localStorage.getItem('spotify_token');
        if (!token) return;
        
        const { top, bottom, average } = await getTopAndBottomArtists(token);
        setTopArtists(top);
        setBottomArtists(bottom);
        setAverageScore(average.toFixed(1));
      } catch (error) {
        console.error('Error fetching artist rankings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRankings();
  }, []);

  return { topArtists, bottomArtists, averageScore, loading };
}