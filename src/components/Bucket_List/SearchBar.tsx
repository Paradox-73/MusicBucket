import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useSpotifyStore } from '../../store/Bucket_List/spotify';
import { useSpotifySearch } from '../../hooks/Bucket_List/useSpotifySearch';
import { useDebounce } from '../../hooks/Bucket_List/useDebounce';
import { SearchFilter } from './search/SearchFilter';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'artist' | 'album' | 'track' | 'playlist'>('all');
  const setSearchResults = useSpotifyStore((state) => state.setSearchResults);
  const { search, isLoading, error } = useSpotifySearch();

  const debouncedSearch = useDebounce(async (value: string, filter: string) => {
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }
    const types = filter === 'all' 
      ? ['artist', 'album', 'track', 'playlist']
      : [filter];
    const results = await search(value, types);
    setSearchResults(results);
  }, 300);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      debouncedSearch(value, selectedFilter);
    },
    [debouncedSearch, selectedFilter]
  );

  const handleFilterChange = (filter: typeof selectedFilter) => {
    setSelectedFilter(filter);
    if (query.length >= 2) {
      debouncedSearch(query, filter);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search for artists, albums, songs..."
          className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-white placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        {isLoading && (
          <div className="mt-2 text-sm text-gray-400">Searching...</div>
        )}
        {error && (
          <div className="mt-2 text-sm text-red-400">{error}</div>
        )}
      </div>
      <SearchFilter 
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}