import React from 'react';
import { ListFilter, SortAsc } from 'lucide-react';
import { useSpotifyStore } from '../../store/Bucket_List/spotify';

export function Filters() {
  const { filter, itemTypeFilter, sortBy, setFilter, setItemTypeFilter, setSortBy } = useSpotifyStore();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center space-x-2">
        <ListFilter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <select
          value={itemTypeFilter}
          onChange={(e) => setItemTypeFilter(e.target.value as any)}
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="all">All Types</option>
          <option value="artist">Artists</option>
          <option value="album">Albums</option>
          <option value="track">Tracks</option>
          <option value="playlist">Playlists</option>
          <option value="podcast">Podcasts</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <ListFilter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="all">All Items</option>
          <option value="not-listened">Not Listened</option>
          <option value="listened">Listened</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <SortAsc className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="date">Date Added</option>
          <option value="name">Name</option>
          <option value="priority">Priority</option>
        </select>
      </div>
    </div>
  );
}