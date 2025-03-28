import { create } from 'zustand';
import { DBClient } from '../../lib/Bucket_List/db/client';
import { SpotifyState, SpotifyItem } from '../../types/Bucket_List/spotify';

export const useSpotifyStore = create<SpotifyState>((set, get) => {
  const db = DBClient.getInstance();

  // Load initial items from database
  db.getItems().then((items) => set({ items }));

  return {
    items: [],
    filter: 'all',
    sortBy: 'date',
    searchResults: [],

    addItem: async (item) => {
      const newItem = {
        ...item,
        addedAt: new Date().toISOString(),
        listened: false,
        priority: 'medium',
      };

      try {
        await db.addItem(newItem);
        set((state) => ({
          items: [newItem, ...state.items],
          searchResults: [], // Clear search results after adding
        }));
      } catch (error) {
        console.error('Error adding item:', error);
      }
    },

    removeItem: async (id) => {
      try {
        await db.deleteItem(id);
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
          await db.updateItem(id, { listened: !item.listened });
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, listened: !item.listened } : item
            ),
          }));
        }
      } catch (error) {
        console.error('Error updating listened status:', error);
      }
    },

    updateNotes: async (id, notes) => {
      try {
        await db.updateItem(id, { notes });
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, notes } : item
          ),
        }));
      } catch (error) {
        console.error('Error updating notes:', error);
      }
    },

    updatePriority: async (id, priority) => {
      try {
        await db.updateItem(id, { priority });
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, priority } : item
          ),
        }));
      } catch (error) {
        console.error('Error updating priority:', error);
      }
    },

    backup: async () => {
      try {
        await db.backup();
      } catch (error) {
        console.error('Error creating backup:', error);
      }
    },

    restore: async (file: File) => {
      try {
        await db.restore(file);
        const items = await db.getItems();
        set({ items });
      } catch (error) {
        console.error('Error restoring backup:', error);
      }
    },

    setFilter: (filter) => set({ filter }),
    setSortBy: (sortBy) => set({ sortBy }),
    setSearchResults: (searchResults) => set({ searchResults }),
  };
});