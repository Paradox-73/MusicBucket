import { useState, useEffect } from 'react';
import { RankedArtist } from '../../types/Artist_Exploration/artist';
import { useAuth } from '../../hooks/useAuth';
import { getOrCreateUserSpotifyData } from '../../lib/supabaseArtistData';

export function useArtistRankings() {
  const { user } = useAuth();
  const [topArtists, setTopArtists] = useState<RankedArtist[]>([]);
  const [bottomArtists, setBottomArtists] = useState<RankedArtist[]>([]);
  const [averageScore, setAverageScore] = useState<string>('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getOrCreateUserSpotifyData(user.id);
        if (!userData || !userData.artist_exploration_scores) {
          setLoading(false);
          return;
        }

        const scores = Object.values(userData.artist_exploration_scores).map((s: any) => s.score);
        if (scores.length === 0) {
          setLoading(false);
          return;
        }

        // Calculate average score
        const totalScore = scores.reduce((sum: number, score: number) => sum + score, 0);
        const avg = totalScore / scores.length;
        setAverageScore(avg.toFixed(1));

        // Prepare artists for ranking
        const allRankedArtists: RankedArtist[] = Object.entries(userData.artist_exploration_scores).map(([artistId, scoreData]: [string, any]) => ({
          id: artistId,
          name: scoreData.artistName, // Assuming artistName is stored in scoreData
          score: scoreData.score,
          imageUrl: scoreData.artistImageUrl, // Assuming artistImageUrl is stored
        }));

        // Sort and get top/bottom artists
        const sortedArtists = [...allRankedArtists].sort((a, b) => b.score - a.score);
        setTopArtists(sortedArtists.slice(0, 5)); // Top 5
        setBottomArtists(sortedArtists.slice(-5).reverse()); // Bottom 5

      } catch (error) {
        console.error('Error fetching artist rankings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRankings();
  }, [user]);

  return { topArtists, bottomArtists, averageScore, loading };
}