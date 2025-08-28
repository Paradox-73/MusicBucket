import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createSpotifyApi } from '../../lib/Dashboard/spotify';
import { SpotifyAuth } from '../../lib/spotify/auth';

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
}

interface Track {
  id: string;
  name: string;
  popularity: number;
  duration_ms: number;
  album: {
    release_date: string;
  };
}

interface PlaylistTrack {
  track: Track;
}

interface PlaylistCardProps {
  playlist: Playlist;
}

const calculateMetrics = (tracks: PlaylistTrack[]) => {
  if (tracks.length === 0) return null;

  const totalTracks = tracks.length;
  const avgPopularity = tracks.reduce((sum, item) => sum + item.track.popularity, 0) / totalTracks;
  const avgReleaseYear = tracks.reduce((sum, item) => {
    const year = new Date(item.track.album.release_date).getFullYear();
    return sum + (isNaN(year) ? 0 : year);
  }, 0) / totalTracks;
  const totalDurationMs = tracks.reduce((sum, item) => sum + item.track.duration_ms, 0);
  const avgDurationMs = totalDurationMs / totalTracks;
  const minutes = Math.floor(avgDurationMs / 60000);
  const seconds = ((avgDurationMs % 60000) / 1000).toFixed(0);
  const avgDurationMin = `${minutes}:${(parseInt(seconds) < 10 ? '0' : '')}${seconds}`;

  return {
    totalTracks,
    avgPopularity: Math.round(avgPopularity),
    avgReleaseYear: Math.round(avgReleaseYear),
    avgDurationMin,
  };
};

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  const spotifyAuth = SpotifyAuth.getInstance();

  const { data: tracks, isLoading } = useQuery({
    queryKey: ['playlistTracks', playlist.id],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token);
      
      const tracks: PlaylistTrack[] = [];
      let offset = 0;
      while (true) {
        const response = await spotifyApi.getPlaylistTracks(playlist.id, offset, 100);
        const { items, total } = response.data;
        if (!items.length) break;
        tracks.push(...items.filter(i => i.track));
        if (tracks.length >= total) break;
        offset += 100;
      }
      return tracks;
    }
  });

  const metrics = tracks ? calculateMetrics(tracks) : null;

  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center mb-4">
                <img src={playlist.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={playlist.name} className="w-16 h-16 rounded-md mr-4" />
        <h3 className="text-lg font-bold">{playlist.name}</h3>
      </div>
      {isLoading ? (
        <p>Loading metrics...</p>
      ) : metrics ? (
        <div>
          <p>Total Tracks: {metrics.totalTracks}</p>
          <p>Avg. Popularity: {metrics.avgPopularity}</p>
          <p>Avg. Release Year: {metrics.avgReleaseYear}</p>
          <p>Avg. Song Length: {metrics.avgDurationMin}</p>
        </div>
      ) : (
        <p>Could not load metrics.</p>
      )}
    </div>
  );
};
