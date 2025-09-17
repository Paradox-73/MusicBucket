import React from 'react';

interface TierItemContextMenuProps {
  x: number;
  y: number;
  item: any;
  itemType: 'artist' | 'album' | 'track';
  tiers: any[]; // To allow moving to specific tiers
  onClose: () => void;
  onMoveToTier: (itemId: string, targetTierId: string) => void;
  onMoveToBank: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onViewOnSpotify: (item: any, itemType: 'artist' | 'album' | 'track') => void;
  onShowDetails: (item: any, itemType: 'artist' | 'album' | 'track') => void;
}

const TierItemContextMenu: React.FC<TierItemContextMenuProps> = ({
  x, y, item, itemType, tiers, onClose,
  onMoveToTier, onMoveToBank, onRemove, onViewOnSpotify, onShowDetails
}) => {

  const handleViewOnSpotify = () => {
    onViewOnSpotify(item, itemType);
    onClose();
  };

  const handleShowDetails = () => {
    onShowDetails(item, itemType);
    onClose();
  };

  const handleMoveToBank = () => {
    onMoveToBank(item.id);
    onClose();
  };

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to permanently remove ${item.name}?`)) {
      onRemove(item.id);
    }
    onClose();
  };

  return (
    <div
      className="absolute z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 w-48"
      style={{ top: y, left: x }}
      onMouseLeave={onClose} // Close when mouse leaves the context menu
    >
      <ul className="text-sm text-gray-700 dark:text-gray-200">
        {tiers.map(tier => (
          <li
            key={tier.id}
            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            onClick={() => { onMoveToTier(item.id, tier.id); onClose(); }}
          >
            Move to {tier.label}
          </li>
        ))}
        <hr className="my-1 border-gray-200 dark:border-gray-700" />
        <li
          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          onClick={handleMoveToBank}
        >
          Move to Item Bank
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-red-600 dark:text-red-400"
          onClick={handleRemove}
        >
          Remove from Tier List
        </li>
        <hr className="my-1 border-gray-200 dark:border-gray-700" />
        <li
          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          onClick={handleViewOnSpotify}
        >
          View on Spotify
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          onClick={handleShowDetails}
        >
          Item Details
        </li>
      </ul>
    </div>
  );
};

export default TierItemContextMenu;