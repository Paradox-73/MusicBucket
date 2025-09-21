import { create } from 'zustand';
import { QueryClient } from '@tanstack/react-query';
import { SpotifyAuth } from '../../lib/spotify/auth';
import { createSpotifyApi } from '../../lib/Dashboard/spotify';
import { sleep } from '../../lib/Dashboard/spotify';

// Define types for the data we'll be fetching
type TimeRange = 'short_term' | 'medium_term' | 'long_term';
type PlaylistOwnershipFilter = 'all' | 'mine' | 'others';

interface DashboardDataState {
  queryClient: QueryClient;
  isFetchingDashboardData: boolean;
  initializeDashboardData: (isAuthenticated: boolean, userId?: string) => Promise<void>;
  // Add methods to get specific data if needed, or rely on react-query cache
}

// Helper functions for fetching data (extracted from Dashboard.tsx)
const fetchCurrentUser = async (spotifyAuth: SpotifyAuth) => {
  const token = await spotifyAuth.getAccessToken();
  if (!token) throw new Error('No access token available');
  const spotifyApi = createSpotifyApi(token, () => {}); // Pass a dummy setIsRateLimited
  const response = await spotifyApi.getCurrentUser();
  return response.data;
};

const fetchAllTracks = async (spotifyAuth: SpotifyAuth) => {
  const token = await spotifyAuth.getAccessToken();
  if (!token) throw new Error('No access token available');
  const spotifyApi = createSpotifyApi(token, () => {}); // Pass a dummy setIsRateLimited
  
  const uniqueTrackIds = new Set<string>();
  const allTracks: any[] = [];
  let offset = 0;

  // 1. Fetch all user's playlists
  const playlists: any[] = [];
  offset = 0;
  while (true) {
    const response = await spotifyApi.getPlaylists(offset, 50);
    const { items, total } = response.data;
    if (!items.length) break;
    playlists.push(...items);
    if (playlists.length >= total) break;
    offset += 50;
    await sleep(200); // Add delay
  }

  // 2. Fetch tracks for each playlist (no filtering here)
  for (const playlist of playlists) {
    if (!playlist.id) continue;
    let tracksOffset = 0;
    while (true) {
      try {
        const response = await spotifyApi.getPlaylistTracks(playlist.id, tracksOffset, 100);
        const { items } = response.data;
        if (!items.length) break;
        items.forEach(item => {
          if (item.track && item.track.id) {
            allTracks.push({ ...item, track: { ...item.track, album: item.track.album || {} }, playlistId: playlist.id });
            uniqueTrackIds.add(item.track.id);
          }
        });
        if (items.length < 100) break;
        tracksOffset += 100;
        await sleep(200); // Add delay
      } catch (error) {
        console.error(`Failed to fetch tracks for playlist ${playlist.id}`, error);
        break;
      }
    }
  }

  // 3. Fetch user's saved tracks (liked songs)
  offset = 0;
  while (true) {
    try {
      const response = await spotifyApi.getSavedTracks(offset, 50);
      const { items } = response.data;
      if (!items.length) break;
      items.forEach(item => {
        if (item.track && item.track.id) {
          allTracks.push({ ...item, track: { ...item.track, album: item.track.album || {} } });
          uniqueTrackIds.add(item.track.id);
        }
      });
      if (items.length < 50) break;
      offset += 50;
      await sleep(200); // Add delay
    } catch (error) {
      console.error('Failed to fetch saved tracks', error);
      break;
    }
  }

  // 4. Fetch user's saved albums and their tracks
  offset = 0;
  while (true) {
    try {
      const response = await spotifyApi.getSavedAlbums(offset, 50);
      const { items } = response.data;
      if (!items.length) break;
      for (const item of items) {
        if (item.album && item.album.tracks) {
          let tracksOffset = 0;
          while (true) {
            const tracksResponse = await spotifyApi.getAlbumTracks(item.album.id, tracksOffset, 50);
            const { items: trackItems } = tracksResponse.data;
            if (!trackItems.length) break;
            trackItems.forEach(track => {
              allTracks.push({ added_at: item.added_at, track: { ...track, album: item.album } });
              uniqueTrackIds.add(track.id);
            });
            if (trackItems.length < 50) break;
            tracksOffset += 50;
            await sleep(200); // Add delay
          }
        }
      }
      if (items.length < 50) break;
      offset += 50;
      await sleep(200); // Add delay
    } catch (error) {
      console.error('Failed to fetch saved albums', error);
      break;
    }
  }

  return { allTracks, uniqueSongCount: uniqueTrackIds.size, playlists };
};

const fetchTopArtists = async (spotifyAuth: SpotifyAuth, timeRange: TimeRange) => {
  const token = await spotifyAuth.getAccessToken();
  if (!token) throw new Error('No access token available');
  const spotifyApi = createSpotifyApi(token, () => {});
  const response = await spotifyApi.getTopArtists(timeRange, 50);
  return response.data.items;
};

const fetchTopTracks = async (spotifyAuth: SpotifyAuth, timeRange: TimeRange) => {
  const token = await spotifyAuth.getAccessToken();
  if (!token) throw new Error('No access token available');
  const spotifyApi = createSpotifyApi(token, () => {});
  const response = await spotifyApi.getTopTracks(timeRange, 50);
  return response.data.items;
};


export const useDashboardDataStore = create<DashboardDataState>((set, get) => ({
  queryClient: new QueryClient(),
  isFetchingDashboardData: false,

  initializeDashboardData: async (isAuthenticated: boolean, userId?: string) => {
    if (!isAuthenticated || get().isFetchingDashboardData) {
      return;
    }

    set({ isFetchingDashboardData: true });
    const spotifyAuth = SpotifyAuth.getInstance();
    const queryClient = get().queryClient;

    try {
      // Pre-fetch current user
      await queryClient.prefetchQuery({
        queryKey: ['currentUser'],
        queryFn: () => fetchCurrentUser(spotifyAuth),
        staleTime: Infinity,
      });

      // Get the current user data from cache after prefetching
      const currentUser = queryClient.getQueryData(['currentUser']);
      const currentUserId = (currentUser as any)?.id || userId;

      if (currentUserId) {
        // Pre-fetch all tracks
        await queryClient.prefetchQuery({
          queryKey: ['all-tracks-analysis'],
          queryFn: async () => {
            const { allTracks, uniqueSongCount, playlists } = await fetchAllTracks(spotifyAuth);
            return { allTracks, uniqueSongCount, playlists };
          },
          staleTime: 1000 * 60 * 5,
        });

        // Pre-fetch top artists for all time ranges
        await queryClient.prefetchQuery({
          queryKey: ['topArtists', 'short_term'],
          queryFn: () => fetchTopArtists(spotifyAuth, 'short_term'),
        });
        await queryClient.prefetchQuery({
          queryKey: ['topArtists', 'medium_term'],
          queryFn: () => fetchTopArtists(spotifyAuth, 'medium_term'),
        });
        await queryClient.prefetchQuery({
          queryKey: ['topArtists', 'long_term'],
          queryFn: () => fetchTopArtists(spotifyAuth, 'long_term'),
        });

        // Pre-fetch top tracks for all time ranges
        await queryClient.prefetchQuery({
          queryKey: ['topTracks', 'short_term'],
          queryFn: () => fetchTopTracks(spotifyAuth, 'short_term'),
        });
        await queryClient.prefetchQuery({
          queryKey: ['topTracks', 'medium_term'],
          queryFn: () => fetchTopTracks(spotifyAuth, 'medium_term'),
        });
        await queryClient.prefetchQuery({
          queryKey: ['topTracks', 'long_term'],
          queryFn: () => fetchTopTracks(spotifyAuth, 'long_term'),
        });
      }
    } catch (error) {
      console.error('Error pre-fetching dashboard data:', error);
      // Optionally, clear some cache or set an error state
    } finally {
      set({ isFetchingDashboardData: false });
    }
  },
}));
