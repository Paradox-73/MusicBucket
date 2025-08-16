import SpotifyWebApi from 'spotify-web-api-js';

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
    return null;
  }
};

export const getTopArtists = async () => {
  try {
    const response = await spotifyApi.getMyTopArtists({ limit: 50 });
    return response.items;
  } catch (error) {
    console.error('Error getting top artists:', error);
    return [];
  }
};

export const getAudioFeatures = async (trackIds: string[]) => {
  try {
    const response = await spotifyApi.getAudioFeaturesForTracks(trackIds);
    return response.audio_features;
  } catch (error) {
    console.error('Error getting audio features:', error);
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
    return [];
  }
};

export const searchTracks = async (query: string) => {
  try {
    const response = await spotifyApi.searchTracks(query);
    return response.tracks?.items || [];
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};

export const getArtistTopTracks = async (artistId: string) => {
  try {
    const response = await spotifyApi.getArtistTopTracks(artistId, 'US');
    return response.tracks;
  } catch (error) {
    console.error('Error getting artist top tracks:', error);
    return [];
  }
};

export const getRelatedArtists = async (artistId: string) => {
  try {
    const response = await spotifyApi.getArtistRelatedArtists(artistId);
    return response.artists;
  } catch (error) {
    console.error('Error getting related artists:', error);
    return [];
  }
};

export const getNewReleases = async () => {
  try {
    const response = await spotifyApi.getNewReleases({ limit: 20 });
    return response.albums.items;
  } catch (error) {
    console.error('Error getting new releases:', error);
    return [];
  }
};

export const getFeaturedPlaylists = async () => {
  try {
    const response = await spotifyApi.getFeaturedPlaylists({ limit: 20 });
    return response.playlists.items;
  } catch (error) {
    console.error('Error getting featured playlists:', error);
    return [];
  }
};

export const getCategories = async () => {
  try {
    const response = await spotifyApi.getCategories({ limit: 50 });
    return response.categories.items;
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const getCategoryPlaylists = async (categoryId: string) => {
  try {
    const response = await spotifyApi.getCategoryPlaylists(categoryId, { limit: 20 });
    return response.playlists.items;
  } catch (error) {
    console.error('Error getting category playlists:', error);
    return [];
  }
};

export const getUserPlaylists = async () => {
  try {
    const response = await spotifyApi.getUserPlaylists();
    return response.items;
  } catch (error) {
    console.error('Error getting user playlists:', error);
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
    return null;
  }
};

export const addTracksToPlaylist = async (playlistId: string, trackUris: string[]) => {
  try {
    await spotifyApi.addTracksToPlaylist(playlistId, trackUris);
  } catch (error) {
    console.error('Error adding tracks to playlist:', error);
  }
};

export const getTrack = async (trackId: string) => {
  try {
    const response = await spotifyApi.getTrack(trackId);
    return response;
  } catch (error) {
    console.error('Error getting track:', error);
    return null;
  }
};