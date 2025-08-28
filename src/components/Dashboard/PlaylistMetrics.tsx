import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createSpotifyApi } from '../../lib/Dashboard/spotify';
import { SpotifyAuth } from '../../lib/spotify/auth';
import { PlaylistCard } from './PlaylistCard';

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
}

export const PlaylistMetrics: React.FC = () => {
  const spotifyAuth = SpotifyAuth.getInstance();

  const { data: playlists, isLoading } = useQuery({
    queryKey: ['allPlaylistsForMetrics'],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token);
      
      const playlists: Playlist[] = [];
      let offset = 0;
      while (true) {
        const response = await spotifyApi.getPlaylists(offset, 50);
        const { items, total } = response.data;
        if (!items.length) break;
        playlists.push(...items);
        if (playlists.length >= total) break;
        offset += 50;
      }
      return playlists;
    }
  });

  if (isLoading) {
    return <p>Loading playlists...</p>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Playlist Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists?.map(playlist => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </div>
  );
};
