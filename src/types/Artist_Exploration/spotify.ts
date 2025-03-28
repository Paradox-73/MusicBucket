export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  popularity: number;
  album: {
    release_date: string;
  };
  artists: SpotifyArtist[];
}

export interface ArtistMetrics {
  totalTracks: number;
  likedTracks: SpotifyTrack[];
  score: number;
  details: {
    listenedPercentage: number;
    popularityScore: number;
    recencyScore: number;
  };
}


export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface ArtistMetrics {
  totalTracks: number;
  likedTracks: SpotifyTrack[];
  score: number;
  details: {
    listenedPercentage: number;
    popularityScore: number;
    recencyScore: number;
  };
}