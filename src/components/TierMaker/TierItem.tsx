import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface TierItemProps {
  item: any;
  itemType: 'artist' | 'album' | 'track';
  containerId: string; // Add containerId prop
}

const TierItem: React.FC<TierItemProps> = ({ item, itemType, containerId }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: {
      containerId: containerId,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    touchAction: 'none',
  } : { touchAction: 'none' };

  let imageUrl = '';
  let itemName = item.name;

  if (itemType === 'artist') {
    imageUrl = item.images?.[0]?.url || imageUrl;
  } else if (itemType === 'album') {
    imageUrl = item.images?.[0]?.url || imageUrl;
  } else if (itemType === 'track') {
    imageUrl = item.album?.images?.[0]?.url || imageUrl;
  }

  const isPermanentOverlay = itemType === 'track';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`w-20 h-20 flex-none flex flex-col items-center justify-center cursor-grab relative overflow-hidden rounded ${!isPermanentOverlay ? 'group' : ''}`}>
      {imageUrl && <img src={imageUrl} alt={itemName} className="w-full h-full object-cover aspect-square" />}
      <div
        className={`absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center p-1 transition-opacity ${isPermanentOverlay
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100'
          }`}>
        <span className="text-white text-center text-sm">{itemName}</span>
      </div>
    </div>
  );
};

export default TierItem;