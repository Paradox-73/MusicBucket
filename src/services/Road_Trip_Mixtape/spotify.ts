import axios from 'axios';
import { Artist, Track } from '../../types/Road_Trip_Mixtape';
import { MainAppSpotifyAuth } from '../../lib/spotifyAuth';
import { spotifyApi } from '../../lib/spotify';
import { SpotifyAuth } from '../../lib/spotify/auth';

const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

let accessToken: string | null = null;
const requestQueue: Array<() => Promise<any>> = [];
let isProcessingQueue = false;

// Rate limiting configuration
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60000; // 1 minute in milliseconds
const requestTimestamps: number[] = [];

async function rateLimitRequest<T>(request: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        // Clean up old timestamps
        const now = Date.now();
        while (
          requestTimestamps.length > 0 && 
          now - requestTimestamps[0] > RATE_WINDOW
        ) {
          requestTimestamps.shift();
        }

        // Check if we're over the rate limit
        if (requestTimestamps.length >= RATE_LIMIT) {
          const oldestRequest = requestTimestamps[0];
          const waitTime = RATE_WINDOW - (now - oldestRequest);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        // Make the request
        requestTimestamps.push(Date.now());
        const result = await request();
        resolve(result);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          // Get retry-after header or default to 5 seconds
          const retryAfter = parseInt(error.response.headers['retry-after'] || '5') * 1000;
          await new Promise(resolve => setTimeout(resolve, retryAfter));
          // Retry the request
          const result = await request();
          resolve(result);
        } else {
          reject(error);
        }
      }
    });

    if (!isProcessingQueue) {
      processQueue();
    }
  });
}

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      await request();
    }
  }
  isProcessingQueue = false;
}

async function getAccessToken() {
  if (accessToken) return accessToken;

  try {
    // Use the shared authentication from MusicBucket
    const spotifyAuth = MainAppSpotifyAuth.getInstance();
    const initialized = await spotifyAuth.initialize();
    
    if (!initialized) {
      console.error('Failed to initialize Spotify auth');
      throw new Error('Authentication required');
    }
    
    // Get the access token from the SpotifyAuth in Bucket List via MainAppSpotifyAuth
    const spotifyAuthFromBucketList = await spotifyAuth.isAuthenticated();
    if (!spotifyAuthFromBucketList) {
      console.error('User not authenticated with Spotify');
      throw new Error('Authentication required');
    }
    
    // Get the token from the Bucket List auth
    const bucketListAuth = SpotifyAuth.getInstance();
    accessToken = await bucketListAuth.getAccessToken();
    
    if (!accessToken) {
      console.error('Failed to get access token');
      throw new Error('Authentication required');
    }
    
    return accessToken;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    accessToken = null;
    throw new Error('Failed to authenticate with Spotify');
  }
}

export async function searchArtistsByLocation(location: string, genres?: string[]): Promise<Artist[]> {
  if (!location.trim()) return [];

  return rateLimitRequest(async () => {
    const token = await getAccessToken();
    const searchQuery = `${location}${genres ? ` genre:${genres.join(',')}` : ''}`;
    
    const response = await axios.get(`${SPOTIFY_API_URL}/search`, {
      params: {
        q: searchQuery,
        type: 'artist',
        limit: 10
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.artists.items.map((artist: any) => ({
      id: artist.id,
      name: artist.name,
      location: { lat: 0, lng: 0, name: location },
      genres: artist.genres,
      popularity: artist.popularity,
      images: artist.images
    }));
  });
}

export async function getTopTracks(artistId: string): Promise<Track[]> {
  return rateLimitRequest(async () => {
    const token = await getAccessToken();
    const response = await axios.get(
      `${SPOTIFY_API_URL}/artists/${artistId}/top-tracks?market=US`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data.tracks.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: {
        id: track.artists[0].id,
        name: track.artists[0].name,
        location: { lat: 0, lng: 0, name: '' },
        genres: [],
        popularity: 0,
        images: []
      },
      duration: track.duration_ms / 1000,
      previewUrl: track.preview_url || undefined
    }));
  });
}