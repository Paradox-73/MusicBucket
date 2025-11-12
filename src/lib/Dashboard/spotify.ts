import axios, { AxiosError } from 'axios';
import { toast } from '../../hooks/Recommendation_Roulette/use-toast';
import { useSpotifyStatusStore } from '../../store/spotifyStatusStore';

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

const scopes = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'user-library-modify',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-recently-played',
];

export const getAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
    scope: scopes.join(' '),
  });

  return `${AUTH_ENDPOINT}?${params.toString()}`;
};

export const getAccessToken = async (code: string) => {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
  });

  const response = await axios.post(TOKEN_ENDPOINT, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(
        `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`
      )}`,
    },
  });

  return response.data;
};

export const refreshAccessToken = async (refreshToken: string) => {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await axios.post(TOKEN_ENDPOINT, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(
        `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`
      )}`,
    },
  });

  return response.data;
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withRateLimiting = <T extends (...args: any[]) => any>(
  apiCall: T,
  maxRetries = 5,
  initialDelay = 500,
  onRateLimit?: (isRateLimited: boolean) => void
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    let retries = 0;
    let delay = initialDelay;
    while (true) {
      try {
        const response = await apiCall(...args);
        onRateLimit?.(false);
        return response;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 429 && retries < maxRetries) {
          onRateLimit?.(true);
          const retryAfter = axiosError.response.headers['retry-after'];
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay;
          console.warn(`Rate limited. Retrying after ${waitTime / 1000} seconds...`);
          await sleep(waitTime);
          retries++;
          delay *= 2; // Exponential backoff
        } else if (axiosError.response?.status === 503 || axiosError.code === 'ERR_NETWORK') {
          toast({
            title: 'Spotify API Error',
            description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
            variant: 'destructive',
          });
          throw error; // Re-throw to allow react-query to mark as failed
        } else {
          onRateLimit?.(false);
          throw error;
        }
      }
    }
  };
};

export const createSpotifyApi = (
  accessToken: string,
  onRateLimit?: (isRateLimited: boolean) => void,
  setSpotifyApiAvailability?: (available: boolean) => void,
  setLastUpdated?: (timestamp: number) => void
) => {
  const api = axios.create({
    baseURL: SPOTIFY_BASE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const wrappedWithRateLimiting = <T extends (...args: any[]) => any>(
    apiCall: T,
    maxRetries = 5,
    initialDelay = 500,
    onRateLimit?: (isRateLimited: boolean) => void
  ): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      let retries = 0;
      let delay = initialDelay;
      while (true) {
        try {
          const response = await apiCall(...args);
          onRateLimit?.(false);
          setSpotifyApiAvailability?.(true); // API is available
          setLastUpdated?.(Date.now()); // Update last updated timestamp
          return response;
        } catch (error) {
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 429 && retries < maxRetries) {
            onRateLimit?.(true);
            const retryAfter = axiosError.response.headers['retry-after'];
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay;
            console.warn(`Rate limited. Retrying after ${waitTime / 1000} seconds...`);
            await sleep(waitTime);
            retries++;
            delay *= 2; // Exponential backoff
          } else if (axiosError.response?.status === 503 || axiosError.code === 'ERR_NETWORK') {
            toast({
              title: 'Spotify API Error',
              description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
              variant: 'destructive',
            });
            setSpotifyApiAvailability?.(false); // API is unavailable
            throw error; // Re-throw to allow react-query to mark as failed
          } else {
            onRateLimit?.(false);
            setSpotifyApiAvailability?.(true); // API is available (for other errors)
            throw error;
          }
        }
      }
    };
  };

  return {
    getCurrentUser: wrappedWithRateLimiting(() => api.get('/me'), 5, 500, onRateLimit),
    getPlaylists: wrappedWithRateLimiting((offset: number = 0, limit: number = 50) => api.get(`/me/playlists?offset=${offset}&limit=${limit}`), 5, 500, onRateLimit),
    getPlaylistTracks: wrappedWithRateLimiting((playlistId: string, offset: number = 0, limit: number = 100) => api.get(`/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}`), 5, 500, onRateLimit),
    getSavedTracks: wrappedWithRateLimiting((offset: number = 0, limit: number = 50) => api.get(`/me/tracks?limit=${limit}&offset=${offset}`), 5, 500, onRateLimit),
    getSavedAlbums: wrappedWithRateLimiting((offset: number = 0, limit: number = 50) => api.get(`/me/albums?limit=${limit}&offset=${offset}`), 5, 500, onRateLimit),
    getAlbumTracks: wrappedWithRateLimiting((albumId: string, offset: number = 0, limit: number = 50) => api.get(`/albums/${albumId}/tracks?offset=${offset}&limit=${limit}`), 5, 500, onRateLimit),
    getAudioFeaturesForTracks: wrappedWithRateLimiting((trackIds: string[]) => api.get(`/audio-features?ids=${trackIds.join(',')}`), 5, 500, onRateLimit),
    getRecentlyPlayed: wrappedWithRateLimiting(() => 
      api.get('/me/player/recently-played'), 5, 500, onRateLimit),
    getTopArtists: wrappedWithRateLimiting((time_range: 'short_term' | 'medium_term' | 'long_term', limit: number = 20) => api.get(`/me/top/artists?time_range=${time_range}&limit=${limit}`), 5, 500, onRateLimit),
    getTopTracks: wrappedWithRateLimiting((time_range: 'short_term' | 'medium_term' | 'long_term', limit: number = 20) => api.get(`/me/top/tracks?time_range=${time_range}&limit=${limit}`), 5, 500, onRateLimit),
    getRecentlyPlayedTracks: wrappedWithRateLimiting((limit: number = 50) => api.get(`/me/player/recently-played?limit=${limit}`), 5, 500, onRateLimit),
    getArtist: wrappedWithRateLimiting((artistId: string) => api.get(`/artists/${artistId}`), 5, 500, onRateLimit),
    getArtistRelatedArtists: wrappedWithRateLimiting((artistId: string) => api.get(`/artists/${artistId}/related-artists`), 5, 500, onRateLimit),
    search: wrappedWithRateLimiting((query: string, types = ['track', 'artist', 'album']) =>
      api.get(`/search?q=${encodeURIComponent(query)}&type=${types.join(',')}`), 5, 500, onRateLimit),
    createPlaylist: wrappedWithRateLimiting((userId: string, name: string, description?: string) =>
      api.post(`/users/${userId}/playlists`, { name, description }), 5, 500, onRateLimit),
    addTracksToPlaylist: wrappedWithRateLimiting((playlistId: string, uris: string[]) =>
      api.post(`/playlists/${playlistId}/tracks`, { uris }), 5, 500, onRateLimit),
    getCurrentPlayback: wrappedWithRateLimiting(() => api.get('/me/player'), 5, 500, onRateLimit),
    play: wrappedWithRateLimiting(() => api.put('/me/player/play'), 5, 500, onRateLimit),
    pause: wrappedWithRateLimiting(() => api.put('/me/player/pause'), 5, 500, onRateLimit),
    nextTrack: wrappedWithRateLimiting(() => api.post('/me/player/next'), 5, 500, onRateLimit),
    previousTrack: wrappedWithRateLimiting(() => api.post('/me/player/previous'), 5, 500, onRateLimit),
  };
};