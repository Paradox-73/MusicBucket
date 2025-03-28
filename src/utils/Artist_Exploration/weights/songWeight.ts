import { calculateBaseWeight } from './baseWeight';
import { calculatePopularityWeight } from './popularityWeight';
import { calculateRecencyWeight } from './recencyWeight';
import { SpotifyTrack } from '../../../types/Artist_Exploration/spotify';

export interface SongWeightDetails {
  songId: string;
  name: string;
  baseWeight: number;
  popularityWeight: number;
  recencyWeight: number;
  totalWeight: number;
}

export const calculateSongWeight = (
  track: SpotifyTrack,
  totalArtistSongs: number
): SongWeightDetails => {
  const baseWeight = calculateBaseWeight(totalArtistSongs);
  const popularityWeight = calculatePopularityWeight(track.popularity);
  const recencyWeight = calculateRecencyWeight(track.album.release_date);
  
  const totalWeight = baseWeight * popularityWeight * recencyWeight;
  
  return {
    songId: track.id,
    name: track.name,
    baseWeight,
    popularityWeight,
    recencyWeight,
    totalWeight
  };
};