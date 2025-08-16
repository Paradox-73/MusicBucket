export interface BucketItem {
  id: string; // Supabase generated ID
  spotify_id: string; // Original Spotify ID
  user_id: string;
  name: string;
  imageUrl: string;
  artists?: string[];
  type: 'artist' | 'album' | 'track' | 'playlist' | 'podcast';
  completed: boolean;
  created_at: string;
}