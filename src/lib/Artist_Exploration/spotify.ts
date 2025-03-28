import { calculateMetrics } from '../../utils/Artist_Exploration/metrics';
import { MainAppSpotifyAuth } from '../spotifyAuth';
import { spotifyApi } from '../spotify';
import { SpotifyAuth } from '../spotify/auth';

const spotifyAuth = MainAppSpotifyAuth.getInstance();
const bucketListAuth = SpotifyAuth.getInstance();

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds delay between retries

// Helper function to handle rate limiting and retries
async function fetchWithRetry(url: string, options: RequestInit, retryCount = 0): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retryCount + 1);
    }
    throw error;
  }
}

// Helper function to handle rate limiting between requests
async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const loginWithSpotify = async () => {
  await spotifyAuth.authenticate();
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    const isAuthenticated = await spotifyAuth.isAuthenticated();
    if (isAuthenticated) {
      return await bucketListAuth.getAccessToken();
    }
    return null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

export const searchArtists = async (query: string, token: string) => {
  if (!query.trim()) return [];

  const response = await fetchWithRetry(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=5`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) throw new Error('Failed to search artists');
  const data = await response.json();
  return data.artists.items;
};

export const getLikedTracks = async (token: string) => {
  const tracks = [];
  let next = 'https://api.spotify.com/v1/me/tracks?limit=50';

  while (next) {
    const response = await fetchWithRetry(next, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
        await delay(retryAfter * 1000);
        continue;
      }
      throw new Error('Failed to fetch liked tracks');
    }

    const data = await response.json();
    tracks.push(...data.items.map((item: any) => item.track));
    next = data.next;
    await delay(RATE_LIMIT_DELAY); // Add delay between requests
  }

  return tracks;
};

export const getArtistTracks = async (artistId: string, token: string) => {
  const response = await fetchWithRetry(
    `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) throw new Error('Failed to fetch artist tracks');
  const data = await response.json();
  return data.tracks;
};

export const getArtistAllTracks = async (artistId: string, token: string) => {
  // First get all albums
  const albums = await getAllArtistAlbums(artistId, token);
  const tracks = [];

  // Then get tracks from each album
  for (const album of albums) {
    const response = await fetchWithRetry(
      `https://api.spotify.com/v1/albums/${album.id}/tracks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
        await delay(retryAfter * 1000);
        continue;
      }
      throw new Error('Failed to fetch album tracks');
    }

    const data = await response.json();
    tracks.push(...data.items);
    await delay(RATE_LIMIT_DELAY); // Add delay between requests
  }

  return tracks;
};

export const getAllArtistAlbums = async (artistId: string, token: string) => {
  const albums = [];
  let next = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=50`;

  while (next) {
    const response = await fetchWithRetry(next, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
        await delay(retryAfter * 1000);
        continue;
      }
      throw new Error('Failed to fetch artist albums');
    }

    const data = await response.json();
    albums.push(...data.items);
    next = data.next;
    await delay(RATE_LIMIT_DELAY); // Add delay between requests
  }

  return albums;
};

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
}