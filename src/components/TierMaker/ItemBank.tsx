import React from 'react';
import ScopeSelector from './ScopeSelector';
import { useDroppable } from '@dnd-kit/core';
import TierItem from './TierItem';

interface ItemBankProps {
  items: any[];
  loading: boolean;
  error: string | null;
  selectedScope: string;
  onScopeChange: (scope: string) => void;
  selectedAlbumId: string | null;
  onAlbumSelect: (albumId: string) => void;
  userAlbums: any[];
  containerId: string;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const ItemBank: React.FC<ItemBankProps> = ({
  items,
  loading,
  error,
  selectedScope,
  onScopeChange,
  selectedAlbumId,
  onAlbumSelect,
  userAlbums,
  containerId,
  searchQuery,
  onSearchQueryChange,
}) => {
  const { setNodeRef } = useDroppable({
    id: containerId,
  });

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Item Bank</h2>
      <ScopeSelector selectedScope={selectedScope} onScopeChange={onScopeChange} />

      {selectedScope === 'search' && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search for artist, album, or track..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      )}

      {selectedScope === 'track' && (
        <div className="mb-4">
          <label htmlFor="album-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Album:</label>
          <select
            id="album-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={selectedAlbumId || ''}
            onChange={(e) => onAlbumSelect(e.target.value)}
          >
            <option value="">-- Select an Album --</option>
            {userAlbums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <p className="text-gray-600 dark:text-gray-400">Loading items...</p>}
      {error && <p className="text-red-500 dark:text-red-400">Error: {error}</p>}

      <div ref={setNodeRef} className="flex flex-row gap-2 overflow-x-auto lg:grid lg:grid-cols-[repeat(auto-fill,minmax(80px,1fr))] lg:gap-0 lg:overflow-y-auto lg:max-h-96">
        {items.map((item) => (
          <TierItem
            key={item.id}
            item={item}
            itemType={item.itemType || selectedScope}
            containerId={containerId}
          />
        ))}
      </div>
    </div>
  );
};

export default ItemBank;