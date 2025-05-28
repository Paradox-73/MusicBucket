export interface BucketListItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: 'artist' | 'album' | 'track' | 'playlist';
  completed: boolean;
  created_at: string;
}