export interface User {
  id: string;
  email?: string;
  spotify_id?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}