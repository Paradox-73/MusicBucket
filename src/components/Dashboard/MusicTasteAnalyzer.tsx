import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createSpotifyApi } from '../../lib/Dashboard/spotify';
import { useSpotifyAuthBridge } from '../../lib/spotifyAuth';
import { SpotifyAuth } from '../../lib/spotify/auth';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface Artist {
  id: string;
  name: string;
  popularity: number;
}

interface Track {
  id: string;
  name: string;
  artists: Artist[];
  popularity: number;
}

const calculateScore = (tracks: Track[], uniqueArtists: Set<string>) => {
  if (tracks.length === 0) return 0;

  // Base score from quantity (max 30 points)
  const quantityScore = Math.min(tracks.length / 1000 * 30, 30);
  
  // Artist diversity score (max 20 points)
  const artistDiversityScore = Math.min(uniqueArtists.size / tracks.length * 20, 20);
  
  // Underground score based on inverse popularity (max 50 points)
  const avgPopularity = tracks.reduce((sum, track) => sum + track.popularity, 0) / tracks.length;
  const undergroundScore = (100 - avgPopularity) * 0.5; // Lower popularity = higher score

  return Math.round(quantityScore + artistDiversityScore + undergroundScore);
};

export const MusicTasteAnalyzer: React.FC = () => {
  const spotifyAuth = SpotifyAuth.getInstance();

  const { data, isLoading, error } = useQuery({
    queryKey: ['saved-tracks'],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token);
      
      const tracks: Track[] = [];
      let offset = 0;
      
      while (true) {
        const response = await spotifyApi.getSavedTracks(offset);
        const { items, total } = response.data;
        
        if (!items.length) break;
        
        tracks.push(...items.map((item: any) => item.track));
        
        if (tracks.length >= total) break;
        offset += 50;
      }
      
      return tracks;
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to analyze music taste" />;
  if (!data) return null;

  const uniqueArtists = new Set(
    data.flatMap(track => track.artists.map(artist => artist.id))
  );

  const score = calculateScore(data, uniqueArtists);

  // Calculate variety score
  const varietyScore = new Set(data.flatMap(track => 
    track.artists.map(artist => artist.name)
  )).size / data.length * 100;

  const sortedByPopularity = [...data].sort((a, b) => b.popularity - a.popularity);
  const mostPopular = sortedByPopularity.slice(0, 5);
  const mostUnderground = sortedByPopularity.slice(-5).reverse();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-3xl font-bold mb-6">Your Music Taste Analysis</h2>
      
      <div className="mb-8">
        <div className="text-5xl sm:text-6xl font-bold text-green-500 mb-2">{score}/100</div>
        <p className="text-gray-500 dark:text-gray-400">Based on library size, artist diversity, and music obscurity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Library Stats</h3>
          <ul className="space-y-2">
            <li>Total Tracks: {data.length}</li>
            <li>Unique Artists: {uniqueArtists.size}</li>
            <li>Artist Variety Score: {Math.round(varietyScore)}/100</li>
            <li>Average Track Popularity: {Math.round(data.reduce((sum, track) => sum + track.popularity, 0) / data.length)}/100</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Most Popular Tracks</h3>
          <ul className="space-y-2">
            {mostPopular.map(track => (
              <li key={track.id} className="text-sm">
                {track.name} - {track.artists[0].name} ({track.popularity}/100)
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Most Underground Tracks</h3>
          <ul className="space-y-2">
            {mostUnderground.map(track => (
              <li key={track.id} className="text-sm">
                {track.name} - {track.artists[0].name} ({track.popularity}/100)
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};