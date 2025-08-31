import axios, { AxiosError } from 'axios';

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
        } else {
          onRateLimit?.(false);
          throw error;
        }
      }
    }
  };
};

export const createSpotifyApi = (accessToken: string, onRateLimit?: (isRateLimited: boolean) => void) => {
  const api = axios.create({
    baseURL: SPOTIFY_BASE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    getCurrentUser: withRateLimiting(() => api.get('/me'), 5, 500, onRateLimit),
    getPlaylists: withRateLimiting((offset: number = 0, limit: number = 50) => api.get(`/me/playlists?offset=${offset}&limit=${limit}`), 5, 500, onRateLimit),
    getPlaylistTracks: withRateLimiting((playlistId: string, offset: number = 0, limit: number = 100) => api.get(`/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}`), 5, 500, onRateLimit),
    getSavedTracks: withRateLimiting((offset: number = 0, limit: number = 50) => api.get(`/me/tracks?limit=${limit}&offset=${offset}`), 5, 500, onRateLimit),
    getAudioFeaturesForTracks: withRateLimiting((trackIds: string[]) => api.get(`/audio-features?ids=${trackIds.join(',')}`), 5, 500, onRateLimit),
    getRecentlyPlayed: withRateLimiting(() => 
      api.get('/me/player/recently-played'), 5, 500, onRateLimit),
    getTopArtists: withRateLimiting((time_range: 'short_term' | 'medium_term' | 'long_term', limit: number = 20) => api.get(`/me/top/artists?time_range=${time_range}&limit=${limit}`), 5, 500, onRateLimit),
    getTopTracks: withRateLimiting((time_range: 'short_term' | 'medium_term' | 'long_term', limit: number = 20) => api.get(`/me/top/tracks?time_range=${time_range}&limit=${limit}`), 5, 500, onRateLimit),
    getRecentlyPlayedTracks: withRateLimiting((limit: number = 50) => api.get(`/me/player/recently-played?limit=${limit}`), 5, 500, onRateLimit),
    getArtist: withRateLimiting((artistId: string) => api.get(`/artists/${artistId}`), 5, 500, onRateLimit),
    getArtistRelatedArtists: withRateLimiting((artistId: string) => api.get(`/artists/${artistId}/related-artists`), 5, 500, onRateLimit),
    search: withRateLimiting((query: string, types = ['track', 'artist', 'album']) =>
      api.get(`/search?q=${encodeURIComponent(query)}&type=${types.join(',')}`), 5, 500, onRateLimit),
    createPlaylist: withRateLimiting((userId: string, name: string, description?: string) =>
      api.post(`/users/${userId}/playlists`, { name, description }), 5, 500, onRateLimit),
    addTracksToPlaylist: withRateLimiting((playlistId: string, uris: string[]) =>
      api.post(`/playlists/${playlistId}/tracks`, { uris }), 5, 500, onRateLimit),
    getCurrentPlayback: withRateLimiting(() => api.get('/me/player'), 5, 500, onRateLimit),
    play: withRateLimiting(() => api.put('/me/player/play'), 5, 500, onRateLimit),
    pause: withRateLimiting(() => api.put('/me/player/pause'), 5, 500, onRateLimit),
    nextTrack: withRateLimiting(() => api.post('/me/player/next'), 5, 500, onRateLimit),
    previousTrack: withRateLimiting(() => api.post('/me/player/previous'), 5, 500, onRateLimit),
  };
};