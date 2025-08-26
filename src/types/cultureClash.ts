export interface Playlist {
  name: string;
  spotifyEmbedUrl: string;
}

export interface CountryCultureData {
  name: string;
  flagUrl: string;
  historicalContext: string;
  keyGenres: string[];
  influentialArtists: string[];
  playlists: Playlist[];
  images: string[];
}
