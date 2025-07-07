export interface BucketItem {
  id: string;
  user_id: string;
  name: string;
  imageUrl: string;
  artists?: string[];
  type: 'artist' | 'album' | 'track' | 'playlist' | 'podcast';
  completed: boolean;
  created_at: string;
}