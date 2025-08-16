import { BucketItem } from './bucket';

export interface SpotifyItem {
  id: string;
  type: 'artist' | 'album' | 'track' | 'playlist' | 'podcast';
  name: string;
  imageUrl: string; // Keep imageUrl for display purposes in SearchResults
  artists?: string[]; // Keep artists for display purposes in SearchResults
}

export interface SpotifyState {
  items: BucketItem[];
  filter: 'all' | 'not-listened' | 'listened';
  sortBy: 'name' | 'date' | 'priority';
  searchResults: SpotifyItem[];
  addItem: (item: SpotifyItem) => void;
  removeItem: (id: string) => void;
  toggleListened: (id: string) => void;
  updateNotes: (id: string, notes: string) => void;
  updatePriority: (id: string, priority: 'low' | 'medium' | 'high') => void;
  setFilter: (filter: SpotifyState['filter']) => void;
  setSortBy: (sortBy: SpotifyState['sortBy']) => void;
  setSearchResults: (results: SpotifyItem[]) => void;
  addRandomItem: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}