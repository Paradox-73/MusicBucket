import React from 'react';
import ScopeSelector from './ScopeSelector';
import { useDroppable } from '@dnd-kit/core';
import TierItem from './TierItem';

interface ItemBankProps {
  items: any[];
  loading: boolean;
  error: string | null;
  selectedScope: 'artist' | 'album' | 'track';
  onScopeChange: (scope: 'artist' | 'album' | 'track') => void;
  selectedAlbumId: string | null;
  onAlbumSelect: (albumId: string) => void;
  userAlbums: any[];
  containerId: string;
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
}) => {
  const { setNodeRef } = useDroppable({
    id: containerId,
  });

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Item Bank</h2>
      <ScopeSelector selectedScope={selectedScope} onScopeChange={onScopeChange} />

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

      <div ref={setNodeRef} className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-0 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <TierItem
            key={item.id}
            item={item}
            itemType={selectedScope}
            containerId={containerId}
          />
        ))}
      </div>
    </div>
  );
};

export default ItemBank;