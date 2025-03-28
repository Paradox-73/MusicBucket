export interface SpotifyProfile {
  id: string;
  display_name: string;
  images: { url: string }[];
  email: string;
}

export interface CountryMusic {
  country: string;
  topTracks: SpotifyApi.TrackObjectFull[];
  genres: string[];
  artists: SpotifyApi.ArtistObjectFull[];
}