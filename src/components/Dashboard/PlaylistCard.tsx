import React, { useEffect } from 'react';

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
  external_urls: { spotify: string };
}

interface Track {
  id: string;
  name: string;
  popularity: number;
  duration_ms: number;
  album: {
    id: string;
    name: string;
    release_date: string;
  };
  artists: {
    id: string;
    name: string;
  }[];
}

interface PlaylistTrack {
  track: Track;
}

interface PlaylistCardProps {
  playlist: Playlist;
  tracks: PlaylistTrack[];
  onMetricsCalculated: (playlistId: string, metrics: any) => void;
}

const calculateMetrics = (tracks: PlaylistTrack[]) => {
  if (tracks.length === 0) return null;

  const totalTracks = tracks.length;
  const avgPopularity = tracks.reduce((sum, item) => sum + (item.track?.popularity || 0), 0) / totalTracks;
  const avgReleaseYear = tracks.reduce((sum, item) => {
    const year = new Date(item.track?.album?.release_date).getFullYear();
    return sum + (isNaN(year) ? 0 : year);
  }, 0) / totalTracks;
  const totalDurationMs = tracks.reduce((sum, item) => sum + (item.track?.duration_ms || 0), 0);
  const avgDurationMs = totalDurationMs / totalTracks;
  const minutes = Math.floor(avgDurationMs / 60000);
  const seconds = ((avgDurationMs % 60000) / 1000).toFixed(0);
  const avgDurationMin = `${minutes}:${(parseInt(seconds) < 10 ? '0' : '')}${seconds}`;

  const artistCounts = new Map<string, { count: number, name: string }>();
  const albumCounts = new Map<string, { count: number, name: string }>();

  tracks.forEach(item => {
    if (item.track?.artists?.[0]) {
      const artist = item.track.artists[0];
      const artistData = artistCounts.get(artist.id) || { count: 0, name: artist.name };
      artistCounts.set(artist.id, { ...artistData, count: artistData.count + 1 });
    }
    if (item.track?.album) {
      const album = item.track.album;
      const albumData = albumCounts.get(album.id) || { count: 0, name: album.name };
      albumCounts.set(album.id, { ...albumData, count: albumData.count + 1 });
    }
  });

  const getMostRepeated = (counts: Map<string, { count: number, name: string }>) => {
    if (counts.size === 0) return null;
    let maxCount = 0;
    let result: { id: string, name: string } | null = null;
    counts.forEach((data, id) => {
      if (data.count > maxCount) {
        maxCount = data.count;
        result = { id, name: data.name };
      }
    });
    return result;
  };

  const mostRepeatedArtist = getMostRepeated(artistCounts);
  const mostRepeatedAlbum = getMostRepeated(albumCounts);

  return {
    totalTracks,
    avgPopularity: Math.round(avgPopularity),
    avgReleaseYear: Math.round(avgReleaseYear),
    avgDurationMin,
    mostRepeatedArtist,
    mostRepeatedAlbum,
  };
};

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, tracks, onMetricsCalculated }) => {
  const metrics = calculateMetrics(tracks);

  useEffect(() => {
    if (metrics) {
      onMetricsCalculated(playlist.id, {
        trackCount: metrics.totalTracks,
        avgPopularity: metrics.avgPopularity,
        avgReleaseYear: metrics.avgReleaseYear,
        avgDurationMin: metrics.avgDurationMin,
        mostRepeatedArtist: metrics.mostRepeatedArtist,
        mostRepeatedAlbum: metrics.mostRepeatedAlbum,
      });
    }
  }, [metrics, playlist.id, onMetricsCalculated]);

  return (
    <a href={playlist.external_urls?.spotify} target="_blank" rel="noopener noreferrer" className="block bg-gray-100 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
      <div className="flex items-center mb-4">
        <img src={playlist.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={playlist.name} className="w-16 h-16 rounded-md mr-4" />
        <h3 className="text-lg font-bold">{playlist.name}</h3>
      </div>
      {tracks ? (
        metrics ? (
          <div>
            <p>Total Tracks: {metrics.totalTracks}</p>
            <p>Avg. Popularity: {metrics.avgPopularity}</p>
            <p>Avg. Release Year: {metrics.avgReleaseYear}</p>
            <p>Avg. Song Length: {metrics.avgDurationMin}</p>
            {metrics.mostRepeatedArtist?.name && <p>Most Repeated Artist: {metrics.mostRepeatedArtist.name}</p>}
            {metrics.mostRepeatedAlbum?.name && <p>Most Repeated Album: {metrics.mostRepeatedAlbum.name}</p>}
          </div>
        ) : (
          <p>Could not calculate metrics.</p>
        )
      ) : (
        <p>Loading metrics...</p>
      )}
    </a>
  );
};
