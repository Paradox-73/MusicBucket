import type { SpotifyItem } from '../../../../types/Bucket_List/spotify';

export function transformArtists(artists: any[]): SpotifyItem[] {
  return artists.map((artist) => ({
    id: artist.id,
    type: 'artist',
    name: artist.name,
    imageUrl: artist.images[0]?.url || 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7',
  }));
}