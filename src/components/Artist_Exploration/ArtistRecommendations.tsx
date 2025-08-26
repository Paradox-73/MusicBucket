import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getRecommendations } from '../../lib/Artist_Exploration/spotify';
import { Loader2, AlertCircle } from 'lucide-react';
import { SpotifyArtist } from '../../types/Artist_Exploration/artist';
import { getOrCreateUserSpotifyData } from '../../lib/supabaseArtistData';

interface Props {
  token: string;
  user: User;
}

export function ArtistRecommendations({ token, user }: Props) {
  const [recommendations, setRecommendations] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) {
          throw new Error('User not authenticated.');
        }

        const userData = await getOrCreateUserSpotifyData(user.id);
        if (!userData || !userData.artist_exploration_scores) {
          setLoading(false);
          return;
        }

        const artistScores = Object.values(userData.artist_exploration_scores);
        if (artistScores.length === 0) {
          setLoading(false);
          return;
        }

        // Get top 5 artists by score to use as seeds
        const topArtists = artistScores
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 5)
          .map((s: any) => s.artistId);

        if (topArtists.length === 0) {
          setLoading(false);
          return;
        }

        const fetchedRecommendations = await getRecommendations(token, topArtists);
        setRecommendations(fetchedRecommendations);

      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [token, user]);

  if (loading) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-lg text-center mt-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
        <p className="mt-2 text-gray-600">Loading recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-lg text-center mt-4">
        <AlertCircle className="w-8 h-8 mx-auto text-red-600" />
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-lg text-center mt-4">
        <p className="text-gray-600">No recommendations available at this time.</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg mt-4 dark:bg-gray-800">
      <h3 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">Recommended Artists</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommendations.map(artist => (
          <div key={artist.id} className="flex flex-col items-center text-center">
            {artist.images?.[0] && (
              <img src={artist.images[0].url} alt={artist.name} className="w-20 h-20 rounded-full shadow-md" />
            )}
            <p className="text-sm font-medium mt-2 text-gray-700 dark:text-gray-300">{artist.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}