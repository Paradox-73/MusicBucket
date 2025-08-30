import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createSpotifyApi } from '../../lib/Dashboard/spotify';
import { SpotifyAuth } from '../../lib/spotify/auth';
import { PlaylistCard } from './PlaylistCard';
import { PlaylistPieChart } from './PlaylistPieChart';

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
  owner: {
    id: string;
  };
}

interface PlaylistMetricsProps {
  playlistOwnershipFilter: 'all' | 'mine' | 'others';
}

export const PlaylistMetrics: React.FC<PlaylistMetricsProps> = ({ playlistOwnershipFilter }) => {
  const spotifyAuth = SpotifyAuth.getInstance();
  const [playlistMetricsData, setPlaylistMetricsData] = useState<any[]>([]);

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token);
      const response = await spotifyApi.getCurrentUser();
      return response.data;
    },
  });

  const { data: playlists, isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ['allPlaylistsForMetrics', playlistOwnershipFilter, currentUser?.id],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token);
      
      const fetchedPlaylists: Playlist[] = [];
      let offset = 0;
      while (true) {
        const response = await spotifyApi.getPlaylists(offset, 50);
        const { items, total } = response.data;
        if (!items.length) break;
        fetchedPlaylists.push(...items);
        if (fetchedPlaylists.length >= total) break;
        offset += 50;
      }

      let filteredPlaylists = fetchedPlaylists;
      if (playlistOwnershipFilter === 'mine' && currentUser?.id) {
        filteredPlaylists = fetchedPlaylists.filter(playlist => playlist.owner.id === currentUser.id);
      } else if (playlistOwnershipFilter === 'others' && currentUser?.id) {
        filteredPlaylists = fetchedPlaylists.filter(playlist => playlist.owner.id !== currentUser.id);
      }
      return filteredPlaylists;
    },
    enabled: !!currentUser, // Only run this query if currentUser is available
  });

  const handleMetricsCalculated = (playlistId: string, metrics: any) => {
    setPlaylistMetricsData(prevData => {
      const existingIndex = prevData.findIndex(item => item.id === playlistId);
      if (existingIndex > -1) {
        const newData = [...prevData];
        newData[existingIndex] = { ...newData[existingIndex], ...metrics, id: playlistId };
        return newData;
      } else {
        return [...prevData, { ...metrics, id: playlistId }];
      }
    });
  };

  if (isLoadingPlaylists || isLoadingUser) {
    return <p>Loading playlists...</p>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Playlist Metrics</h2>
      {playlistMetricsData.length > 0 && (
        <PlaylistPieChart data={playlistMetricsData.map(metric => ({
          id: metric.id,
          name: playlists?.find(p => p.id === metric.id)?.name || 'Unknown',
          trackCount: metric.trackCount,
          avgPopularity: metric.avgPopularity,
          avgReleaseYear: metric.avgReleaseYear,
          avgDurationMin: metric.avgDurationMin,
        }))} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists?.map(playlist => (
          <PlaylistCard key={playlist.id} playlist={playlist} onMetricsCalculated={handleMetricsCalculated} />
        ))}
      </div>
    </div>
  );
};
