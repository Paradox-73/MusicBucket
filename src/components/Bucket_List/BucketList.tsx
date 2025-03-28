import React from 'react';
import { Check, Trash2, Star, ExternalLink } from 'lucide-react';
import { useSpotifyStore } from '../../store/Bucket_List/spotify';
import { SpotifyItem } from '../../types/Bucket_List/spotify';

const CATEGORIES = ['artist', 'album', 'track', 'playlist', 'podcast'] as const;

const getSpotifyUrl = (item: SpotifyItem) => {
  const baseUrl = 'https://open.spotify.com';
  return `${baseUrl}/${item.type}/${item.id}`;
};

export function BucketList() {
  const { items, filter, sortBy, toggleListened, removeItem, updatePriority } =
    useSpotifyStore();

  const filteredItems = items.filter((item) => {
    if (filter === 'listened') return item.listened;
    if (filter === 'not-listened') return !item.listened;
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'priority') {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    }
    return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
  });

  const itemsByCategory = CATEGORIES.reduce((acc, category) => {
    acc[category] = sortedItems.filter((item) => item.type === category);
    return acc;
  }, {} as Record<typeof CATEGORIES[number], SpotifyItem[]>);

  return (
    <div className="space-y-8">
      {CATEGORIES.map((category) => {
        const categoryItems = itemsByCategory[category];
        if (categoryItems.length === 0) return null;

        return (
          <div key={category} className="rounded-lg border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold capitalize text-white">{category}s</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                {categoryItems.length} items
              </span>
            </div>
            <div className="space-y-3">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-white">{item.name}</h3>
                        <a
                          href={getSpotifyUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-purple-400"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      {item.artists && (
                        <p className="text-sm text-gray-400">
                          {item.artists.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updatePriority(item.id, 'high')}
                      className={`rounded-full p-2 ${
                        item.priority === 'high'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleListened(item.id)}
                      className={`rounded-full p-2 ${
                        item.listened
                          ? 'bg-green-500/20 text-green-400'
                          : 'text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-full p-2 text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}