import { create } from 'zustand';
import { addBucketListItem, getBucketList, updateBucketListItem, deleteBucketListItem } from '../../services/Bucket_List/supabaseBucketList';
import { useAuthStore } from '../authStore';
import { getTopArtists, getRecommendations } from '../../lib/spotify';
import { SpotifyAuth } from '../../lib/spotify/auth';
import { SpotifyState, SpotifyItem } from '../../types/Bucket_List/spotify';

export const useSpotifyStore = create<SpotifyState>((set, get) => {
  // Load initial items from database
  // This will be called when the user logs in
  useAuthStore.subscribe(
    (state) => state.user,
    async (user) => {
      console.log('Auth state user changed:', user); // Add this
      if (user) {
        try {
          console.log('Attempting to load bucket list for user ID:', user.id); // Add this
          const items = await getBucketList(user.id);
          console.log('Loaded bucket list items:', items); // Add this
          set({ items });
        } catch (error) {
          console.error('Error loading bucket list items:', error);
        }
      } else {
        console.log('User logged out. Clearing bucket list items.'); // Add this
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
    searchQuery: '',

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
        spotify_id: item.id, // Pass Spotify's ID here
      };

      try {
        const addedItemFromDB = await addBucketListItem(newItem);
        // The DB returns a `title` field. The client expects a `name` field.
        // We use the name from the original `item` to ensure the UI updates instantly and correctly.
        const itemForState = {
          ...addedItemFromDB,
          name: newItem.name,
        };
        set((state) => ({
          items: [itemForState, ...state.items],
          searchResults: [], // Clear search results after adding
        }));
      } catch (error) {
        console.error('Error adding item:', error);
      }
    },

    removeItem: async (id) => {
      console.log('removeItem called for ID:', id); // Add this
      try {
        await deleteBucketListItem(id);
        console.log('Item successfully deleted from Supabase:', id); // Add this
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
        console.log('Local store updated after removal.'); // Add this
      } catch (error) {
        console.error('Error removing item:', error); // This should catch the 55000 error if it's still there
      }
    },

    toggleListened: async (id) => {
      console.log('toggleListened called for ID:', id); // Add this
      try {
        const item = get().items.find((i) => i.id === id);
        if (item) {
          console.log('Toggling item:', item); // Add this
          const updatedItem = await updateBucketListItem(id, { completed: !item.completed });
          console.log('Item successfully updated in Supabase:', updatedItem); // Add this
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? updatedItem : item
            ),
          }));
          console.log('Local store updated after toggle.'); // Add this
        }
      } catch (error) {
        console.error('Error updating listened status:', error); // This should catch the 55000 error if it's still there
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
    setSearchQuery: (query) => set({ searchQuery: query }),

    // Add this new action
    loadItems: async (userId: string) => {
      try {
        console.log('loadItems action called for user ID:', userId); // Add this log
        const items = await getBucketList(userId);
        console.log('loadItems action fetched items:', items); // Add this log
        set({ items });
      } catch (error) {
        console.error('Error in loadItems action:', error);
      }
    },

    addRandomItem: async () => {
      try {
        const topArtists = await getTopArtists();
        if (topArtists.length === 0) {
          console.log("No top artists found to seed recommendations.");
          return;
        }

        const seed_artists = [topArtists[0].id]; // Use only the first artist as a seed
        const seed_genres = ['pop']; // Hardcoded genre for testing

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
  }; // <--- Correct closing curly brace for the returned object
});