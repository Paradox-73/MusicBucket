import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createSpotifyApi } from '../../lib/Dashboard/spotify';
import { SpotifyAuth } from '../../lib/spotify/auth';
import { PlaylistCard } from './PlaylistCard';
import { PlaylistPieChart } from './PlaylistPieChart';

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
  external_urls: { spotify: string };
  owner: {
    id: string;
  };
  tracks: any[];
}

interface PlaylistMetricsProps {
  playlistOwnershipFilter: 'all' | 'mine' | 'others';
}

export const PlaylistMetrics: React.FC<PlaylistMetricsProps> = ({ playlistOwnershipFilter }) => {
  const spotifyAuth = SpotifyAuth.getInstance();
  const [playlistMetricsData, setPlaylistMetricsData] = useState<any[]>([]);

  useEffect(() => {
    setPlaylistMetricsData([]);
  }, [playlistOwnershipFilter]);

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

  const { data: allPlaylists, isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ['allPlaylistsWithTracks', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token);
      
      let fetchedPlaylists: any[] = [];
      let offset = 0;
      while (true) {
        const response = await spotifyApi.getPlaylists(offset, 50);
        const { items, total } = response.data;
        if (!items.length) break;
        fetchedPlaylists.push(...items);
        if (fetchedPlaylists.length >= total) break;
        offset += 50;
      }

      try {
        const savedTracksResponse = await spotifyApi.getSavedTracks(0, 1);
        if (savedTracksResponse.data.total > 0) {
          const likedSongsImage = savedTracksResponse.data.items[0]?.track?.album?.images[0]?.url || '';
          const likedSongsPlaylist = {
            id: 'liked-songs',
            name: 'Liked Songs',
            images: [{ url: likedSongsImage }],
            owner: { id: currentUser.id },
            tracks: { total: savedTracksResponse.data.total },
            external_urls: { spotify: 'https://open.spotify.com/collection/tracks' },
          };
          fetchedPlaylists.unshift(likedSongsPlaylist);
        }
      } catch (error) {
        console.error("Failed to fetch liked songs", error);
      }

      const playlistsWithTracks = await Promise.all(
        fetchedPlaylists.map(async (playlist) => {
          const tracks: any[] = [];
          let tracksOffset = 0;
          try {
            if (playlist.id === 'liked-songs') {
              while (true) {
                const response = await spotifyApi.getSavedTracks(tracksOffset, 50);
                const { items, total } = response.data;
                if (!items.length) break;
                tracks.push(...items.filter(i => i.track));
                if (tracks.length >= total) break;
                tracksOffset += 50;
              }
            } else {
              while (true) {
                const response = await spotifyApi.getPlaylistTracks(playlist.id, tracksOffset, 100);
                const { items, total } = response.data;
                if (!items.length) break;
                tracks.push(...items.filter(i => i.track));
                if (tracks.length >= total) break;
                tracksOffset += 100;
              }
            }
          } catch (error) {
            console.error(`Error fetching tracks for ${playlist.name}:`, error);
          }
          return { ...playlist, tracks };
        })
      );

      return playlistsWithTracks;
    },
    enabled: !!currentUser,
  });

  const filteredPlaylists = useMemo(() => {
    if (!allPlaylists) return [];
    if (playlistOwnershipFilter === 'mine' && currentUser?.id) {
      return allPlaylists.filter(playlist => playlist.owner.id === currentUser.id);
    } else if (playlistOwnershipFilter === 'others' && currentUser?.id) {
      return allPlaylists.filter(playlist => playlist.owner.id !== currentUser.id);
    }
    return allPlaylists;
  }, [allPlaylists, playlistOwnershipFilter, currentUser?.id]);

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
          name: filteredPlaylists?.find(p => p.id === metric.id)?.name || 'Unknown',
          trackCount: metric.trackCount,
          avgPopularity: metric.avgPopularity,
          avgReleaseYear: metric.avgReleaseYear,
          avgDurationMin: metric.avgDurationMin,
        }))} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaylists?.map(playlist => (
          <PlaylistCard key={playlist.id} playlist={playlist} tracks={playlist.tracks} onMetricsCalculated={handleMetricsCalculated} />
        ))}
      </div>
    </div>
  );
};
