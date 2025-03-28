export interface Location {
  lat: number;
  lng: number;
  name: string;
}

export interface Route {
  startLocation: Location;
  endLocation: Location;
  waypoints: Location[];
  duration: number; // in seconds
}

export interface Artist {
  id: string;
  name: string;
  location: Location;
  genres: string[];
  popularity: number;
  images: { url: string; width: number; height: number }[];
}

export interface Track {
  id: string;
  name: string;
  artist: Artist;
  duration: number;
  previewUrl?: string;
  albumArt?: string;
}

export interface Playlist {
  tracks: Track[];
  totalDuration: number;
}