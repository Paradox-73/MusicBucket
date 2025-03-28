import React from 'react';
import { Plus } from 'lucide-react';
import { useSpotifyStore } from '../../store/Bucket_List/spotify';
import type { SpotifyItem } from '../../types/Bucket_List/spotify';

export function SearchResults() {
  const searchResults = useSpotifyStore((state) => state.searchResults);
  const addItem = useSpotifyStore((state) => state.addItem);
  const items = useSpotifyStore((state) => state.items);

  const handleAdd = (item: SpotifyItem) => {
    // Check if item already exists in bucketlist
    if (items.some((existing) => existing.id === item.id)) {
      return;
    }
    addItem(item);
  };

  if (searchResults.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {searchResults.map((item) => {
        const isInBucketlist = items.some((existing) => existing.id === item.id);
        
        return (
          <div
            key={item.id}
            className="group relative flex items-center space-x-4 rounded-xl bg-white/5 p-4 shadow-sm transition-all hover:bg-white/10"
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate text-white">{item.name}</h3>
              {item.artists && (
                <p className="text-sm text-gray-400">
                  {item.artists.join(', ')}
                </p>
              )}
            </div>
            <button
              onClick={() => handleAdd(item)}
              disabled={isInBucketlist}
              className={`rounded-full p-2 ${
                isInBucketlist
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'text-gray-400 hover:bg-purple-500/20 hover:text-purple-400'
              }`}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}