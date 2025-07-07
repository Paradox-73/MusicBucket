import { create } from 'zustand';
import { addBucketListItem, getBucketList, updateBucketListItem, deleteBucketListItem } from '../../services/Bucket_List/supabaseBucketList';
import { useAuthStore } from '../authStore';
import { SpotifyState, SpotifyItem } from '../../types/Bucket_List/spotify';

export const useSpotifyStore = create<SpotifyState>((set, get) => {
  // Load initial items from database
  // This will be called when the user logs in
  useAuthStore.subscribe(
    (state) => state.user,
    async (user) => {
      if (user) {
        try {
          const items = await getBucketList(user.id);
          set({ items });
        } catch (error) {
          console.error('Error loading bucket list items:', error);
        }
      } else {
        set({ items: [] }); // Clear items if user logs out
      }
    },
    { fireImmediately: true }
  );

  return {
    items: [],
    filter: 'all',
    sortBy: 'date',
    searchResults: [],

    addItem: async (item) => {
      const user = useAuthStore.getState().user;
      if (!user) {
        console.error('User not authenticated. Cannot add item.');
        return;
      }

      const newItem = {
        user_id: user.id,
        name: item.name,
        imageUrl: item.imageUrl,
        artists: item.artists,
        type: item.type,
        completed: false,
        created_at: new Date().toISOString(),
      };

      try {
        const addedItem = await addBucketListItem(newItem);
        set((state) => ({
          items: [addedItem, ...state.items],
          searchResults: [], // Clear search results after adding
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
          const updatedItem = await updateBucketListItem(id, { listened: !item.listened });
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

    updatePriority: async (id, priority) => {
      try {
        const updatedItem = await updateBucketListItem(id, { priority });
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? updatedItem : item
          ),
        }));
      } catch (error) {
        console.error('Error updating priority:', error);
      }
    },

    

    setFilter: (filter) => set({ filter }),
    setSortBy: (sortBy) => set({ sortBy }),
    setSearchResults: (searchResults) => set({ searchResults }),
  };
});