import { SpotifyTrack } from '../../types/Artist_Exploration/spotify';
import { formatTimeAgo } from './date';
import { calculateSongWeight, SongWeightDetails } from './weights/songWeight';

interface MetricsResult {
  totalTracks: number;
  likedTracks: SpotifyTrack[];
  score: number;
  songWeights: SongWeightDetails[];
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

  return {
    totalTracks: artistTracks.length,
    likedTracks: likedArtistTracks,
    score,
    songWeights,
    details: {
      listenedPercentage: Math.round((likedArtistTracks.length / artistTracks.length) * 100),
      avgPopularity: Math.round(avgPopularity),
      earliestListenDate: earliestDate,
      formattedEarliestListen: formatTimeAgo(earliestDate)
    }
  };
};