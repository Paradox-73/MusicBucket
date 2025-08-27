import React, { useState, useCallback } from 'react';
import { Search, Dice5 } from 'lucide-react';
import { useSpotifyStore } from '../../store/Bucket_List/spotify';
import { useSpotifySearch } from '../../hooks/Bucket_List/useSpotifySearch';
import { useDebounce } from '../../hooks/Bucket_List/useDebounce';

export function SearchBar({ listId }: { listId: string }) {
  const [query, setQuery] = useState('');
  const { setSearchResults, addRandomItem, setSearchQuery } = useSpotifyStore();
  const { search, isLoading, error } = useSpotifySearch();

  const debouncedSearch = useDebounce(async (value: string) => {
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }
    const types = ['artist', 'album', 'track', 'playlist'];
    const results = await search(value, types);
    setSearchResults(results);
  }, 300);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setSearchQuery(value); // Update search query in store
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleFeelingLucky = () => {
    addRandomItem();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search artists, albums, tracks..."
          className="w-full sm:flex-1 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        {isLoading && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
        )}
        {error && (
          <div className="mt-2 text-sm text-red-400">{error}</div>
        )}
      </div>
      <button 
        onClick={handleFeelingLucky}
        className="rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 p-2 text-gray-900 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-white/10"
        title="I'm Feeling Lucky"
      >
        <Dice5 className="h-5 w-5" />
      </button>
    </div>
  );
}
