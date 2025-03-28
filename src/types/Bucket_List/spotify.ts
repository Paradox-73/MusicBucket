export interface SpotifyItem {
  id: string;
  type: 'artist' | 'album' | 'track' | 'playlist' | 'podcast';
  name: string;
  imageUrl: string;
  artists?: string[];
  addedAt: string;
  listened: boolean;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface SpotifyState {
  items: SpotifyItem[];
  filter: 'all' | 'not-listened' | 'listened';
  sortBy: 'name' | 'date' | 'priority';
  searchResults: SpotifyItem[];
  addItem: (item: Omit<SpotifyItem, 'addedAt' | 'listened' | 'priority'>) => void;
  removeItem: (id: string) => void;
  toggleListened: (id: string) => void;
  updateNotes: (id: string, notes: string) => void;
  updatePriority: (id: string, priority: SpotifyItem['priority']) => void;
  setFilter: (filter: SpotifyState['filter']) => void;
  setSortBy: (sortBy: SpotifyState['sortBy']) => void;
  setSearchResults: (results: SpotifyItem[]) => void;
}