import React from 'react';
import { Filters } from '../Filters';
import { BucketList } from '../BucketList';
import { useSpotifyStore } from '../../../store/Bucket_List/spotify';
import { SpotifyItem } from '../../../types/Bucket_List/spotify';
import { Music } from 'lucide-react';

export function BucketListPanel() {
  const { items, addItem, filter, itemTypeFilter, setSortBy, sortBy } = useSpotifyStore();

  const filteredItems = items.filter((item) => {
    // Filter by completion status
    if (filter === 'listened') return item.completed;
    if (filter === 'not-listened') return !item.completed;

    // Filter by item type
    if (itemTypeFilter !== 'all' && item.type !== itemTypeFilter) return false;

    return true;
  });

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData('text/plain')) as SpotifyItem;
    if (items.some((existing) => existing.spotify_id === item.id)) {
      return;
    }
    addItem(item);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="flex h-full flex-col bg-gray-100 dark:bg-black/90" onDragOver={handleDragOver} onDrop={handleDrop}>
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 border-b border-gray-200 dark:border-white/10 px-4 py-3 sm:px-6 sm:py-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Bucket List</h2>
        <div className="flex items-center gap-2"> {/* New div to group filters and sort */}
          <Filters />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredItems.length > 0 ? (
          <BucketList items={filteredItems} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              {filter === 'listened' ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Get listening!</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">You haven't marked any items as listened yet.</p>
                </>
              ) : filter === 'not-listened' ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Congrats!</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">You've listened to everything in your bucket.</p>
                </>
              ) : (
                <>
                  <Music size={64} className="text-gray-400 dark:text-neutral-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your bucket is empty!</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Use the search panel on the left to find artists, albums, and tracks to add.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
