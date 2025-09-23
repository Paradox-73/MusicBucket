import React, { useState, useEffect } from 'react';
import { BucketList } from '../BucketList';
import { useSpotifyStore } from '../../../store/Bucket_List/spotify';
import { SpotifyItem } from '../../../types/Bucket_List/spotify';
import { Music } from 'lucide-react';
import BucketListListView from '../BucketListListView';

interface BucketListPanelProps {
  isSearchPanelCollapsed: boolean;
  isListView: boolean;
  selectedItems: Set<string>;
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  massSelectMode: boolean;
  setMassSelectMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export function BucketListPanel({ isSearchPanelCollapsed, isListView, selectedItems, setSelectedItems, massSelectMode, setMassSelectMode }: BucketListPanelProps) {
  const { items, addItem, filter, itemTypeFilter, sortBy, sortOrder } = useSpotifyStore();

  const filteredItems = items.filter((item) => {
    // Filter by completion status
    if (filter === 'listened') return item.completed;
    if (filter === 'not-listened') return !item.completed;

    // Filter by item type
    if (itemTypeFilter !== 'all' && item.type !== itemTypeFilter) return false;

    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name) * order;
    }
    if (sortBy === 'completed') {
      if (a.completed === b.completed) return 0;
      return (a.completed ? 1 : -1) * order;
    }
    if (sortBy === 'date') {
        return (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) * order;
    }
    if (a.position !== b.position) {
      return (a.position - b.position) * order;
    }
    return (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) * order;
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
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredItems.length > 0 ? (
          isListView ? (
            <BucketListListView items={sortedItems} selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
          ) : (
            <BucketList items={sortedItems} selectedItems={selectedItems} setSelectedItems={setSelectedItems} isSearchPanelCollapsed={isSearchPanelCollapsed} massSelectMode={massSelectMode} setMassSelectMode={setMassSelectMode} />
          )
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
