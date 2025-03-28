import { RankedArtist } from '../../../types/Artist_Exploration/artist';
import { SpotifyTrack } from '../../../types/Artist_Exploration/spotify';
import { getLikedTracks, getArtistAllTracks } from './api';
import { calculateMetrics } from '../../../utils/Artist_Exploration/metrics';

export async function getTopAndBottomArtists(token: string): Promise<{
  top: RankedArtist[];
  bottom: RankedArtist[];
  average: number;
}> {
  // Get user's liked tracks
  const likedTracks = await getLikedTracks(token);
  
  // Group tracks by artist
  const artistTracks = new Map<string, SpotifyTrack[]>();
  for (const track of likedTracks) {
    const artist = track.artists[0];
    if (!artist) continue;
    
    if (!artistTracks.has(artist.id)) {
      artistTracks.set(artist.id, []);
    }
    artistTracks.get(artist.id)!.push(track);
  }
  
  // Calculate metrics for each artist
  const artistMetrics = new Map<string, RankedArtist>();
  for (const [artistId, tracks] of artistTracks.entries()) {
    const artist = tracks[0].artists[0];
    const allArtistTracks = await getArtistAllTracks(artistId, token);
    const metrics = calculateMetrics(allArtistTracks, tracks, artistId);
    
    artistMetrics.set(artistId, {
      id: artistId,
      name: artist.name,
      imageUrl: artist.images?.[0]?.url,
      score: metrics.score,
      tracksCount: metrics.totalTracks
    });
  }
  
  // Convert to array and sort
  const artists = Array.from(artistMetrics.values());
  const sortedArtists = artists.sort((a, b) => b.score - a.score);
  
  // Calculate average score
  const average = artists.reduce((sum, artist) => sum + artist.score, 0) / artists.length;
  
  return {
    top: sortedArtists.slice(0, 5),
    bottom: sortedArtists.slice(-5).reverse(),
    average
  };
}