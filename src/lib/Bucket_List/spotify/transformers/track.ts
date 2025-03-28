import type { SpotifyItem } from '../../../../types/Bucket_List/spotify';

export function transformTracks(tracks: any[]): SpotifyItem[] {
  return tracks.map((track) => ({
    id: track.id,
    type: 'track',
    name: track.name,
    imageUrl: track.album.images[0]?.url,
    artists: track.artists.map((artist: any) => artist.name),
  }));
}