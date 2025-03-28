import type { SpotifyItem } from '../../../../types/Bucket_List/spotify';

export function transformAlbums(albums: any[]): SpotifyItem[] {
  return albums.map((album) => ({
    id: album.id,
    type: 'album',
    name: album.name,
    imageUrl: album.images[0]?.url,
    artists: album.artists.map((artist: any) => artist.name),
  }));
}