import React, { useEffect } from 'react';
import { Filters } from '../Filters';
import { BucketList } from '../BucketList';
import { useSpotifyStore } from '../../../store/Bucket_List/spotify';
import { useAuthStore } from '../../../store/authStore';
import { SpotifyItem } from '../../../types/Bucket_List/spotify';

export function BucketListPanel() {
  const { items, addItem, loadItems, filter } = useSpotifyStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    console.log('BucketListPanel: user changed', user);
    if (user) {
      loadItems(user.id);
    }
  }, [user, loadItems]);

  const filteredItems = items.filter((item) => {
    console.log('BucketListPanel: filtering - item.completed:', item.completed, 'filter:', filter);
    if (filter === 'listened') return item.completed;
    if (filter === 'not-listened') return !item.completed;
    return true;
  });

  console.log('BucketListPanel: items.length:', items.length, 'filter:', filter, 'filteredItems.length:', filteredItems.length);

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
    <div className="flex h-full flex-col bg-black/90" onDragOver={handleDragOver} onDrop={handleDrop}>
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Your Bucket List</h2>
        <Filters />
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        {filteredItems.length > 0 ? (
          <BucketList items={filteredItems} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              {filter === 'listened' ? (
                <>
                  <h3 className="text-lg font-semibold text-white">Get listening!</h3>
                  <p className="mt-2 text-sm text-gray-400">You haven't marked any items as listened yet.</p>
                </>
              ) : filter === 'not-listened' ? (
                <>
                  <h3 className="text-lg font-semibold text-white">Congrats!</h3>
                  <p className="mt-2 text-sm text-gray-400">You've listened to everything in your bucket.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-white">Your bucket is empty!</h3>
                  <p className="mt-2 text-sm text-gray-400">
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