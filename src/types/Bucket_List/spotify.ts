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
  itemTypeFilter: 'all' | 'artist' | 'album' | 'track' | 'playlist' | 'podcast'; // Added for FR-1.4
  sortBy: 'name' | 'date';
  searchResults: SpotifyItem[];
  addItem: (item: SpotifyItem) => void;
  removeItem: (id: string) => void;
  toggleListened: (id: string) => void;
  updateNotes: (id: string, notes: string) => void;
  
  setFilter: (filter: SpotifyState['filter']) => void;
  setSortBy: (sortBy: SpotifyState['sortBy']) => void;
  setItemTypeFilter: (filter: SpotifyState['itemTypeFilter']) => void; // Added for FR-1.4
  setSearchResults: (results: SpotifyItem[]) => void;
  addRandomItem: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  reorderItems: (reorderedItems: BucketItem[]) => Promise<void>; // Added for FR-1.1
}