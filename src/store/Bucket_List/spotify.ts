import { create } from 'zustand';
import { addItemToBucketList, getBucketListItems, updateBucketListItem, deleteBucketListItem, updateBucketListItemCompletion, updateBucketListItemPositions } from '../../services/Bucket_List/supabaseBucketList';
import { useAuthStore } from '../authStore';
import { getTopArtists, getRecommendations } from '../../lib/spotify';
import { SpotifyAuth } from '../../lib/spotify/auth';
import { SpotifyState, SpotifyItem } from '../../types/Bucket_List/spotify';

export const useSpotifyStore = create<SpotifyState>((set, get) => ({
  items: [],
  filter: 'all',
  itemTypeFilter: 'all', // Added for FR-1.4
  sortBy: 'date',
  searchResults: [],
  searchQuery: '',
  currentListId: null,

  setCurrentListId: (listId) => set({ currentListId: listId }),

  loadListItems: async (listId) => {
    try {
      const items = await getBucketListItems(listId);
      set({ items });
    } catch (error) {
      console.error('Error loading bucket list items:', error);
    }
  },

  addItem: async (item) => {
    const user = useAuthStore.getState().user;
    const listId = get().currentListId;
    if (!user || !listId) {
      console.error('User not authenticated or no list selected. Cannot add item.');
      return;
    }

    const newItem = {
      user_id: user.id,
      name: item.name,
      imageUrl: item.imageUrl,
      artists: item.artists,
      type: item.type,
      completed: false,
      spotify_id: item.id,
      position: Date.now(), // Assign a unique position for new items
    };

    try {
      const addedItemFromDB = await addItemToBucketList(newItem, listId);
      const itemForState = {
        ...addedItemFromDB,
        name: newItem.name,
      };
      set((state) => ({
        items: [itemForState, ...state.items],
        searchResults: [],
      }));
    } catch (error) {
      console.error('Error adding item:', error);
    }
  },

  removeItem: async (id) => {
    try {
      await deleteBucketListItem(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  },

  toggleListened: async (id) => {
    try {
      const item = get().items.find((i) => i.id === id);
      if (item) {
        const updatedItem = await updateBucketListItemCompletion(id, !item.completed); // Use the new function
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? updatedItem : item
          ),
        }));
      }
    } catch (error) {
      console.error('Error updating listened status:', error);
    }
  },

  updateNotes: async (id, notes) => {
    try {
      const updatedItem = await updateBucketListItem(id, { notes });
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? updatedItem : item
        ),
      }));
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  },

  

  setFilter: (filter) => set({ filter }),
  setItemTypeFilter: (filter) => set({ itemTypeFilter: filter }), // Added for FR-1.4
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  addRandomItem: async () => {
    try {
      const topArtists = await getTopArtists();
      if (topArtists.length === 0) {
        console.log("No top artists found to seed recommendations.");
        return;
      }

      const seed_artists = [topArtists[0].id];
      const seed_genres = ['pop'];

      const recommendations = await getRecommendations(seed_artists, seed_genres, []);

      if (recommendations.length === 0) {
        console.log("Could not find any recommendations.");
        return;
      }

      const randomTrack = recommendations[Math.floor(Math.random() * recommendations.length)];

      const itemToAdd: SpotifyItem = {
        id: randomTrack.id,
        type: 'track',
        name: randomTrack.name,
        imageUrl: randomTrack.album.images[0]?.url || '',
        artists: randomTrack.artists.map(artist => artist.name),
      };

      get().addItem(itemToAdd);

    } catch (error) {
      console.error('Error adding random item:', error);
    }
  },

  reorderItems: async (reorderedItems) => {
    set({ items: reorderedItems }); // Optimistic update
    try {
      // Prepare items for backend update (only id and position needed)
      const itemsToUpdate = reorderedItems.map(item => ({
        id: item.id,
        position: item.position,
      }));
      await updateBucketListItemPositions(itemsToUpdate);
    } catch (error) {
      console.error('Error reordering items:', error);
      // TODO: Implement rollback or error handling for UI if backend update fails
    }
  },
}));
