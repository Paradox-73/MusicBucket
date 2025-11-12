import SpotifyWebApi from 'spotify-web-api-js';
import { toast } from '../hooks/Recommendation_Roulette/use-toast';

export const spotifyApi = new SpotifyWebApi();

export const setAccessToken = (token: string) => {
  console.log('spotify.ts: Setting access token:', token);
  spotifyApi.setAccessToken(token);
};

export const getMe = async () => {
  try {
    const response = await spotifyApi.getMe();
    return response;
  } catch (error) {
    console.error('Error getting user profile:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return null;
  }
};

export const getTopArtists = async () => {
  try {
    const response = await spotifyApi.getMyTopArtists({ limit: 50 });
    return response.items;
  } catch (error) {
    console.error('Error getting top artists:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getAudioFeatures = async (trackIds: string[]) => {
  try {
    const response = await spotifyApi.getAudioFeaturesForTracks(trackIds);
    return response.audio_features;
  } catch (error) {
    console.error('Error getting audio features:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getRecommendations = async (seed_artists?: string[], seed_genres?: string[], seed_tracks?: string[]) => {
  try {
    const options: any = { limit: 100 };
    if (seed_artists && seed_artists.length > 0) options.seed_artists = seed_artists;
    if (seed_genres && seed_genres.length > 0) options.seed_genres = seed_genres;
    if (seed_tracks && seed_tracks.length > 0) options.seed_tracks = seed_tracks;

    const response = await spotifyApi.getRecommendations(options);
    return response.tracks;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const searchTracks = async (query: string) => {
  try {
    const response = await spotifyApi.searchTracks(query);
    return response.tracks?.items || [];
  } catch (error) {
    console.error('Error searching tracks:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getArtistTopTracks = async (artistId: string) => {
  try {
    const response = await spotifyApi.getArtistTopTracks(artistId, 'US');
    return response.tracks;
  } catch (error) {
    console.error('Error getting artist top tracks:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getRelatedArtists = async (artistId: string) => {
  try {
    const response = await spotifyApi.getArtistRelatedArtists(artistId);
    return response.artists;
  } catch (error) {
    console.error('Error getting related artists:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getNewReleases = async () => {
  try {
    const response = await spotifyApi.getNewReleases({ limit: 20 });
    return response.albums.items;
  } catch (error) {
    console.error('Error getting new releases:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getFeaturedPlaylists = async () => {
  try {
    const response = await spotifyApi.getFeaturedPlaylists({ limit: 20 });
    return response.playlists.items;
  } catch (error) {
    console.error('Error getting featured playlists:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getCategories = async () => {
  try {
    const response = await spotifyApi.getCategories({ limit: 50 });
    return response.categories.items;
  } catch (error) {
    console.error('Error getting categories:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getCategoryPlaylists = async (categoryId: string) => {
  try {
    const response = await spotifyApi.getCategoryPlaylists(categoryId, { limit: 20 });
    return response.playlists.items;
  } catch (error) {
    console.error('Error getting category playlists:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getUserPlaylists = async () => {
  try {
    const response = await spotifyApi.getUserPlaylists();
    return response.items;
  } catch (error) {
    console.error('Error getting user playlists:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const createPlaylist = async (name: string, description: string) => {
  try {
    const user = await spotifyApi.getMe();
    const response = await spotifyApi.createPlaylist(user.id, {
      name,
      description,
      public: false,
    });
    return response;
  } catch (error) {
    console.error('Error creating playlist:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return null;
  }
};

export const addTracksToPlaylist = async (playlistId: string, trackUris: string[]) => {
  try {
    await spotifyApi.addTracksToPlaylist(playlistId, trackUris);
  } catch (error) {
    console.error('Error adding tracks to playlist:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
  }
};

export const getTrack = async (trackId: string) => {
  try {
    const response = await spotifyApi.getTrack(trackId);
    return response;
  } catch (error) {
    console.error('Error getting track:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return null;
  }
};

export const getMyFollowedArtists = async () => {
  try {
    let artists: SpotifyApi.ArtistObjectFull[] = [];
    let response;
    let after: string | undefined = undefined;

    do {
      response = await spotifyApi.getFollowedArtists({ limit: 50, after });
      if (response && response.artists) {
        artists = artists.concat(response.artists.items);
        after = response.artists.cursors.after;
      }
    } while (after);

    return artists;
  } catch (error) {
    console.error('Error getting followed artists:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getMySavedAlbums = async () => {
  try {
    let albums: SpotifyApi.SavedAlbumObject[] = [];
    let response;
    let offset = 0;

    do {
      response = await spotifyApi.getMySavedAlbums({ limit: 50, offset });
      if (response && response.items) {
        albums = albums.concat(response.items);
        offset += response.items.length;
      }
    } while (response && response.next);

    return albums;
  } catch (error) {
    console.error('Error getting saved albums:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getAlbumTracks = async (albumId: string) => {
  try {
    let tracks: SpotifyApi.TrackObjectSimplified[] = [];
    let response;
    let offset = 0;

    do {
      response = await spotifyApi.getAlbumTracks(albumId, { limit: 50, offset });
      if (response && response.items) {
        tracks = tracks.concat(response.items);
        offset += response.items.length;
      }
    } while (response && response.next);

    return tracks;
  } catch (error) {
    console.error('Error getting album tracks:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getSeveralArtists = async (artistIds: string[]) => {
  try {
    const response = await spotifyApi.getArtists(artistIds);
    return response.artists;
  } catch (error) {
    console.error('Error getting several artists:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getSeveralAlbums = async (albumIds: string[]) => {
  try {
    const response = await spotifyApi.getAlbums(albumIds);
    return response.albums;
  } catch (error) {
    console.error('Error getting several albums:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getSeveralTracks = async (trackIds: string[]) => {
  try {
    const response = await spotifyApi.getTracks(trackIds);
    return response.tracks;
  } catch (error) {
    console.error('Error getting several tracks:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getTopTracks = async () => {
  try {
    const response = await spotifyApi.getMyTopTracks({ limit: 50 });
    return response.items;
  } catch (error) {
    console.error('Error getting top tracks:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getSavedTracks = async () => {
  try {
    let tracks: SpotifyApi.SavedTrackObject[] = [];
    let response;
    let offset = 0;

    do {
      response = await spotifyApi.getMySavedTracks({ limit: 50, offset });
      if (response && response.items) {
        tracks = tracks.concat(response.items);
        offset += response.items.length;
      }
    } while (response && response.next);

    return tracks;
  } catch (error) {
    console.error('Error getting saved tracks:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const getPlaylistTracks = async (playlistId: string) => {
  try {
    let tracks: SpotifyApi.PlaylistTrackObject[] = [];
    let response;
    let offset = 0;

    do {
      response = await spotifyApi.getPlaylistTracks(playlistId, { limit: 50, offset });
      if (response && response.items) {
        tracks = tracks.concat(response.items);
        offset += response.items.length;
      }
    } while (response && response.next);

    return tracks;
  } catch (error) {
    console.error('Error getting playlist tracks:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const searchSpotify = async (query: string, types: ('artist' | 'album' | 'track')[]) => {
  try {
    const response = await spotifyApi.search(query, types);
    return response;
  } catch (error) {
    console.error('Error searching Spotify:', error);
    toast({
      title: 'Spotify API Error',
      description: 'Cannot connect to Spotify. Some features may be unavailable. Please try again later.',
      variant: 'destructive',
    });
    return { artists: { items: [] }, albums: { items: [] }, tracks: { items: [] } };
  }
};