import { calculateMetrics } from '../../utils/Artist_Exploration/metrics';
import { MainAppSpotifyAuth } from '../spotifyAuth';
import { spotifyApi } from '../spotify';
import { SpotifyAuth } from '../spotify/auth';
import { User } from '@supabase/supabase-js';
import {
  getLikedTracksFromSupabase,
  saveLikedTracksToSupabase,
  getArtistDiscographyFromSupabase,
  saveArtistDiscographyToSupabase,
} from '../supabaseArtistData';
import { SpotifyArtist, SpotifyTrack } from '../../types/Artist_Exploration/spotify';

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

export const getLikedTracks = async (token: string, user: User, onProgress?: (progress: number) => void): Promise<SpotifyTrack[]> => {
  if (!user) {
    console.warn('User not provided for getLikedTracks, fetching without caching.');
    return await _fetchLikedTracksFromSpotify(token, onProgress);
  }

  // Try to get from Supabase first
  const supabaseTracks = await getLikedTracksFromSupabase(user.id);
  if (supabaseTracks && supabaseTracks.length > 0) {
    console.log('Returning liked tracks from Supabase.');
    if (onProgress) onProgress(100); // Indicate 100% progress if cached
    return supabaseTracks;
  }

  console.log('No liked tracks in Supabase or Supabase fetch failed. Fetching from Spotify and saving to Supabase.');
  const tracks = await _fetchLikedTracksFromSpotify(token, onProgress);
  await saveLikedTracksToSupabase(user.id, tracks);
  return tracks;
};

// Internal function to fetch liked tracks directly from Spotify
const _fetchLikedTracksFromSpotify = async (token: string, onProgress?: (progress: number) => void): Promise<SpotifyTrack[]> => {
  const tracks: SpotifyTrack[] = [];
  let next = 'https://api.spotify.com/v1/me/tracks?limit=50';
  let totalTracks = 0;

  console.log('Starting _fetchLikedTracksFromSpotify');

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
    totalTracks = data.total; // Get total tracks from the first response

    console.log(`Fetched ${tracks.length} tracks, Total: ${totalTracks}, Next: ${next}`);

    if (onProgress && totalTracks > 0) {
      const progress = Math.round((tracks.length / totalTracks) * 100);
      console.log(`Calculated progress: ${progress}%`);
      onProgress(progress);
    } else if (onProgress && totalTracks === 0) {
      console.log('Total tracks is 0, not reporting progress.');
    }

    await delay(RATE_LIMIT_DELAY); // Add delay between requests
  }

  console.log('Finished _fetchLikedTracksFromSpotify');
  if (onProgress) onProgress(100); // Ensure 100% is reported at the end
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

export const getArtistAllTracks = async (artistId: string, token: string, user: User): Promise<SpotifyTrack[]> => {
  if (!user) {
    console.warn('User not provided for getArtistAllTracks, fetching without caching.');
    return await _fetchArtistAllTracksFromSpotify(artistId, token);
  }

  const cachedDiscography = await getArtistDiscographyFromSupabase(user.id, artistId);
  if (cachedDiscography) {
    console.log(`Returning discography for artist ${artistId} from Supabase cache.`);
    return cachedDiscography;
  }

  console.log(`Fetching discography for artist ${artistId} from Spotify and saving to Supabase.`);
  const tracks = await _fetchArtistAllTracksFromSpotify(artistId, token);
  await saveArtistDiscographyToSupabase(user.id, artistId, tracks);
  return tracks;
};

// Internal function to fetch all artist tracks directly from Spotify
const _fetchArtistAllTracksFromSpotify = async (artistId: string, token: string): Promise<SpotifyTrack[]> => {
  // First get all albums
  const albums = await getAllArtistAlbums(artistId, token);
  const tracks: SpotifyTrack[] = [];

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

export const getArtistTopTracks = async (artistId: string, token: string) => {
  const response = await fetchWithRetry(
    `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) throw new Error('Failed to fetch artist top tracks');
  const data = await response.json();
  return data.tracks;
};

export const getArtistAlbums = async (artistId: string, token: string) => {
  const albums = [];
  let next = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single,compilation&limit=50`;

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

export const getRelatedArtists = async (artistId: string, token: string) => {
  const response = await fetchWithRetry(
    `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) throw new Error('Failed to fetch related artists');
  const data = await response.json();
  return data.artists;
};

export const getRecommendations = async (token: string, seedArtistIds: string[]): Promise<SpotifyArtist[]> => {
  if (seedArtistIds.length === 0) return [];

  const seedArtists = seedArtistIds.join(',');
  const response = await fetchWithRetry(
    `https://api.spotify.com/v1/recommendations?seed_artists=${seedArtists}&limit=10`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) throw new Error('Failed to fetch recommendations');
  const data = await response.json();
  // Spotify recommendations return tracks, we need to extract artists from them
  const recommendedArtists: SpotifyArtist[] = [];
  const artistIds = new Set<string>();

  data.tracks.forEach((track: any) => {
    track.artists.forEach((artist: SpotifyArtist) => {
      if (!artistIds.has(artist.id)) {
        recommendedArtists.push(artist);
        artistIds.add(artist.id);
      }
    });
  });

  return recommendedArtists;
};

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
}