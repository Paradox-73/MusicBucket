export interface Artist {
  id: string;
  name: string;
  image_url?: string;
}

export interface ArtistScore {
  artist_id: string;
  user_id: string;
  listened_songs: number;
  favorite_songs: number;
  listened_albums: number;
  concert_attendance: number;
  merch_owned: number;
  score: number;
  created_at: Date;
  updated_at: Date;
}

export interface RankedArtist {
  id: string;
  name: string;
  imageUrl?: string;
  score: number;
  tracksCount: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
}
