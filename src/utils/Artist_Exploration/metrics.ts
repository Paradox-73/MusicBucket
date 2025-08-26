import { SpotifyTrack } from '../../types/Artist_Exploration/spotify';
import { formatTimeAgo } from './date';
import { calculateSongWeight, SongWeightDetails } from './weights/songWeight';

interface LikedAlbum {
  id: string;
  name: string;
  imageUrl: string;
  likedTrackCount: number;
}

interface MetricsResult {
  totalTracks: number;
  likedTracks: SpotifyTrack[];
  score: number;
  songWeights: SongWeightDetails[];
  likedAlbums: LikedAlbum[];
  topLikedTracks: SpotifyTrack[];
  details: {
    listenedPercentage: number;
    avgPopularity: number;
    earliestListenDate: Date;
    formattedEarliestListen: string;
  };
}

export const calculateMetrics = (
  artistTracks: SpotifyTrack[],
  likedTracks: SpotifyTrack[],
  artistId: string
): MetricsResult => {
  const likedArtistTracks = likedTracks.filter(track => 
    track.artists?.some(artist => artist.id === artistId)
  );

  // Calculate weights for each liked song
  const songWeights = likedArtistTracks.map(track => 
    calculateSongWeight(track, artistTracks.length)
  );

  // Calculate total score (sum of weights * 100 for 0-100 scale)
  const totalWeight = songWeights.reduce((sum, weight) => sum + weight.totalWeight, 0);
  const score = Math.round(totalWeight * 100);

  // Calculate average popularity
  const avgPopularity = likedArtistTracks.reduce(
    (sum, track) => sum + (track.popularity || 0),
    0
  ) / (likedArtistTracks.length || 1);

  // Find earliest listened track
  const sortedByDate = [...likedArtistTracks].sort((a, b) => 
    new Date(a.album.release_date).getTime() - new Date(b.album.release_date).getTime()
  );
  
  const earliestTrack = sortedByDate[0];
  const earliestDate = earliestTrack ? new Date(earliestTrack.album.release_date) : new Date();

  // Group liked tracks by album
  const likedAlbumsMap = new Map<string, LikedAlbum>();
  likedArtistTracks.forEach(track => {
    if (track.album) {
      const albumId = track.album.id;
      if (!likedAlbumsMap.has(albumId)) {
        likedAlbumsMap.set(albumId, {
          id: albumId,
          name: track.album.name,
          imageUrl: track.album.images?.[0]?.url || '',
          likedTrackCount: 0,
        });
      }
      const album = likedAlbumsMap.get(albumId);
      if (album) {
        album.likedTrackCount++;
      }
    }
  });
  const likedAlbums = Array.from(likedAlbumsMap.values());

  // Get top 5 liked tracks by popularity
  const topLikedTracks = [...likedArtistTracks].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 5);

  return {
    totalTracks: artistTracks.length,
    likedTracks: likedArtistTracks,
    score,
    songWeights,
    likedAlbums,
    topLikedTracks,
    details: {
      listenedPercentage: Math.round((likedArtistTracks.length / artistTracks.length) * 100),
      avgPopularity: Math.round(avgPopularity),
      earliestListenDate: earliestDate,
      formattedEarliestListen: formatTimeAgo(earliestDate)
    }
  };
};