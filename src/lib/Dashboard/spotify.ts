import axios from 'axios';

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

export const createSpotifyApi = (accessToken: string) => {
  const api = axios.create({
    baseURL: SPOTIFY_BASE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    getCurrentUser: () => api.get('/me'),
    getPlaylists: () => api.get('/me/playlists'),
    getSavedTracks: (offset = 0) => 
      api.get(`/me/tracks?limit=50&offset=${offset}`),
    getRecentlyPlayed: () => 
      api.get('/me/player/recently-played'),
    getTopArtists: (time_range: 'short_term' | 'medium_term' | 'long_term', limit: number = 20) => api.get(`/me/top/artists?time_range=${time_range}&limit=${limit}`),
    getTopTracks: (time_range: 'short_term' | 'medium_term' | 'long_term', limit: number = 20) => api.get(`/me/top/tracks?time_range=${time_range}&limit=${limit}`),
    getRecentlyPlayedTracks: (limit: number = 50) => api.get(`/me/player/recently-played?limit=${limit}`),
    search: (query: string, types = ['track', 'artist', 'album']) =>
      api.get(`/search?q=${encodeURIComponent(query)}&type=${types.join(',')}`),
    createPlaylist: (userId: string, name: string, description?: string) =>
      api.post(`/users/${userId}/playlists`, { name, description }),
    addTracksToPlaylist: (playlistId: string, uris: string[]) =>
      api.post(`/playlists/${playlistId}/tracks`, { uris }),
    getCurrentPlayback: () => api.get('/me/player'),
    play: () => api.put('/me/player/play'),
    pause: () => api.put('/me/player/pause'),
    nextTrack: () => api.post('/me/player/next'),
    previousTrack: () => api.post('/me/player/previous'),
  };
};