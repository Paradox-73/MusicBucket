import React, { useEffect, useState } from 'react';
import { SpotifyArtist } from '../../types/Artist_Exploration/artist';
import { SpotifyTrack } from '../../types/Artist_Exploration/spotify';
import { User } from '@supabase/supabase-js';
import { getArtistAllTracks } from '../../lib/Artist_Exploration/spotify';
import { calculateMetrics } from '../../utils/Artist_Exploration/metrics';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  getArtistExplorationScoreFromSupabase,
  saveArtistExplorationScoreToSupabase,
} from '../../lib/supabaseArtistData';

interface Props {
  artist1: SpotifyArtist;
  artist2: SpotifyArtist;
  token: string;
  likedTracks: SpotifyTrack[];
  user: User;
}

export function ArtistComparison({ artist1, artist2, token, likedTracks, user }: Props) {
  const [metrics1, setMetrics1] = useState<any>(null);
  const [metrics2, setMetrics2] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) {
          throw new Error('User not authenticated.');
        }

        // Fetch/calculate metrics for artist 1
        let currentMetrics1 = await getArtistExplorationScoreFromSupabase(user.id, artist1.id);
        if (!currentMetrics1) {
          const artistTracks1 = await getArtistAllTracks(artist1.id, token, user);
          if (!artistTracks1 || !likedTracks) {
            throw new Error(`Failed to fetch data for ${artist1.name}`);
          }
          currentMetrics1 = calculateMetrics(artistTracks1, likedTracks, artist1.id);
          await saveArtistExplorationScoreToSupabase(user.id, artist1.id, currentMetrics1);
        }
        setMetrics1(currentMetrics1);

        // Fetch/calculate metrics for artist 2
        let currentMetrics2 = await getArtistExplorationScoreFromSupabase(user.id, artist2.id);
        if (!currentMetrics2) {
          const artistTracks2 = await getArtistAllTracks(artist2.id, token, user);
          if (!artistTracks2 || !likedTracks) {
            throw new Error(`Failed to fetch data for ${artist2.name}`);
          }
          currentMetrics2 = calculateMetrics(artistTracks2, likedTracks, artist2.id);
          await saveArtistExplorationScoreToSupabase(user.id, artist2.id, currentMetrics2);
        }
        setMetrics2(currentMetrics2);

      } catch (err) {
        console.error('Error during comparison data fetch:', err);
        setError(err instanceof Error ? err.message : 'Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [artist1.id, artist2.id, token, likedTracks, user]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
        <p className="mt-2 text-gray-600">Loading comparison data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg text-center">
        <AlertCircle className="w-8 h-8 mx-auto text-red-600" />
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    );
  }

  if (!metrics1 || !metrics2) {
    return (
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg text-center">
        <AlertCircle className="w-8 h-8 mx-auto text-yellow-600" />
        <p className="mt-2 text-gray-600">No comparison data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">Artist Comparison</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Artist 1 Column */}
        <div className="flex flex-col items-center space-y-4">
          {artist1.images?.[0] && (
            <img
              src={artist1.images[0].url}
              alt={artist1.name}
              className="w-24 h-24 rounded-full"
            />
          )}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{artist1.name}</h3>
          <div className="text-4xl font-bold text-green-600 dark:text-green-400">
            {metrics1.score?.toFixed(2) || '0.00'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Exploration Score</div>

          <div className="w-full space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>Listened Songs:</strong> {metrics1.likedTracks?.length || 0} / {metrics1.totalTracks || 0} ({metrics1.details?.listenedPercentage || 0}%)</p>
            <p><strong>Avg. Popularity:</strong> {metrics1.details?.avgPopularity || 0}/100</p>
            <p><strong>Started Listening:</strong> {metrics1.details?.formattedEarliestListen || 'N/A'}</p>
            {metrics1.topLikedTracks && metrics1.topLikedTracks.length > 0 && (
              <div>
                <p className="font-medium mt-2">Top Liked Tracks:</p>
                <ul className="list-disc list-inside text-sm">
                  {metrics1.topLikedTracks.map((track: SpotifyTrack) => (
                    <li key={track.id}>{track.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {metrics1.likedAlbums && metrics1.likedAlbums.length > 0 && (
              <div>
                <p className="font-medium mt-2">Albums Explored:</p>
                <ul className="list-disc list-inside text-sm">
                  {metrics1.likedAlbums.map((album: any) => (
                    <li key={album.id}>{album.name} ({album.likedTrackCount} tracks)</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Artist 2 Column */}
        <div className="flex flex-col items-center space-y-4">
          {artist2.images?.[0] && (
            <img
              src={artist2.images[0].url}
              alt={artist2.name}
              className="w-24 h-24 rounded-full"
            />
          )}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{artist2.name}</h3>
          <div className="text-4xl font-bold text-green-600 dark:text-green-400">
            {metrics2.score?.toFixed(2) || '0.00'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Exploration Score</div>

          <div className="w-full space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>Listened Songs:</strong> {metrics2.likedTracks?.length || 0} / {metrics2.totalTracks || 0} ({metrics2.details?.listenedPercentage || 0}%)</p>
            <p><strong>Avg. Popularity:</strong> {metrics2.details?.avgPopularity || 0}/100</p>
            <p><strong>Started Listening:</strong> {metrics2.details?.formattedEarliestListen || 'N/A'}</p>
            {metrics2.topLikedTracks && metrics2.topLikedTracks.length > 0 && (
              <div>
                <p className="font-medium mt-2">Top Liked Tracks:</p>
                <ul className="list-disc list-inside text-sm">
                  {metrics2.topLikedTracks.map((track: SpotifyTrack) => (
                    <li key={track.id}>{track.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {metrics2.likedAlbums && metrics2.likedAlbums.length > 0 && (
              <div>
                <p className="font-medium mt-2">Albums Explored:</p>
                <ul className="list-disc list-inside text-sm">
                  {metrics2.likedAlbums.map((album: any) => (
                    <li key={album.id}>{album.name} ({album.likedTrackCount} tracks)</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}