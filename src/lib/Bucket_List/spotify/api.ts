import { SpotifyAuth } from './auth';
import { transformArtists, transformAlbums, transformTracks } from './transformers';
import type { SpotifyItem } from '../../../types/Bucket_List/spotify';

export class SpotifyAPI {
  private static instance: SpotifyAPI;
  private auth: SpotifyAuth;

  private constructor() {
    this.auth = SpotifyAuth.getInstance();
  }

  static getInstance(): SpotifyAPI {
    if (!SpotifyAPI.instance) {
      SpotifyAPI.instance = new SpotifyAPI();
    }
    return SpotifyAPI.instance;
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const token = await this.auth.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    return response.json();
  }

  async search(query: string, types: string[] = ['artist', 'album', 'track', 'playlist', 'show']): Promise<SpotifyItem[]> {
    const params = new URLSearchParams({
      q: query,
      type: types.join(','),
      limit: '10',
    });

    const data = await this.fetch(`/search?${params}`);
    return this.transformSearchResults(data);
  }

  private transformSearchResults(data: any): SpotifyItem[] {
    const items: SpotifyItem[] = [];

    if (data.artists?.items) {
      items.push(...transformArtists(data.artists.items));
    }

    if (data.albums?.items) {
      items.push(...transformAlbums(data.albums.items));
    }

    if (data.tracks?.items) {
      items.push(...transformTracks(data.tracks.items));
    }

    return items;
  }
}