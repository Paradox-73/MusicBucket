export interface BucketItem {
  id: string; // Supabase generated ID
  spotify_id: string; // Original Spotify ID
  user_id: string;
  name: string;
  imageUrl: string;
  artists?: string[];
  type: 'artist' | 'album' | 'track' | 'playlist' | 'podcast';
  completed: boolean;
  notes?: string; // Added for FR-1.3
  position: number; // Added for FR-1.1
  created_at: string;
}