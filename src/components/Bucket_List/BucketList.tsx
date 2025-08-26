import React, { useEffect } from 'react'; // Add useEffect
import { Check, Trash2, Star, ExternalLink } from 'lucide-react';
import { useSpotifyStore } from '../../store/Bucket_List/spotify';
import { SpotifyItem } from '../../types/Bucket_List/spotify';
import { useAuthStore } from '../../store/authStore'; // Import useAuthStore

const CATEGORIES = ['artist', 'album', 'track', 'playlist', 'podcast'] as const;

const getSpotifyUrl = (item: SpotifyItem) => {
  const baseUrl = 'https://open.spotify.com';
  // Use the spotify_id for the URL, not the database id
  return `${baseUrl}/${item.type}/${item.spotify_id}`;
};

interface BucketListProps {
  items: SpotifyItem[];
}

export function BucketList({ items }: BucketListProps) {
  const { sortBy, toggleListened, removeItem, updatePriority } = 
    useSpotifyStore();

  const sortedItems = [...items].sort((a, b) => {
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
          <div key={category} className="">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold capitalize text-gray-900 dark:text-white">{category}s</h2>
              <span className="rounded-full bg-gray-200 dark:bg-white/10 px-3 py-1 text-sm font-medium text-gray-900 dark:text-white">
                {categoryItems.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categoryItems.map((item) => {
                const handleCardClick = () => {
                  window.open(getSpotifyUrl(item), '_blank');
                };

                const isArtist = item.type === 'artist';

                return (
                  <div
                    key={item.id}
                    className={`group relative cursor-pointer overflow-hidden transition-all duration-300 ease-in-out ${isArtist ? '' : 'rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:border-purple-500/50 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                    onClick={handleCardClick}
                  >
                    <div className="flex justify-center p-4">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                          item.type === 'artist'
                            ? 'h-32 w-32 rounded-full'
                            : 'h-40 w-full rounded-md'
                        }`}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                    <div className={`absolute bottom-0 left-0 right-0 p-4 ${item.type === 'artist' ? 'text-center' : ''}`}>
                      <h3 className="truncate font-bold text-gray-900 dark:text-white" title={item.name}>{item.name}</h3>
                      {item.artists && (
                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                          {item.artists.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Quick Actions on Hover */}
                    <div 
                      className="absolute right-2 top-2 flex items-center space-x-1 opacity-0 transition-all duration-300 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()} // Prevent card click when interacting with buttons
                    >
                      <button
                        onClick={() => updatePriority(item.id, 'high')}
                        className={`rounded-full p-2 transition-colors ${item.priority === 'high'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-200/50 dark:bg-black/50 text-gray-600 dark:text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-400'
                          }`}
                      >
                        <Star className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleListened(item.id)}
                        className={`rounded-full p-2 transition-colors ${item.completed
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-200/50 dark:bg-black/50 text-gray-600 dark:text-gray-300 hover:bg-green-500/20 hover:text-green-400'
                          }`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-full bg-gray-200/50 dark:bg-black/50 p-2 text-gray-600 dark:text-gray-300 transition-colors hover:bg-red-500/20 hover:text-red-400"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Status Tag */}
                    {item.completed && (
                       <div className="absolute left-2 top-2 rounded-full bg-green-500/20 px-2 py-1 text-xs font-bold text-green-300">
                         LISTENED
                       </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}