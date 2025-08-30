import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface TierItemProps {
  item: any;
  itemType: 'artist' | 'album' | 'track';
  containerId: string; // Add containerId prop
}

const TierItem: React.FC<TierItemProps> = ({ item, itemType, containerId }) => {
  const draggableData = React.useMemo(() => ({
    itemType: itemType,
    itemData: item,
    containerId: containerId,
  }), [itemType, item, containerId]);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: draggableData,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  let imageUrl = 'https://via.placeholder.com/64';
  let itemName = item.name;

  if (itemType === 'artist') {
    imageUrl = item.images?.[0]?.url || imageUrl;
  } else if (itemType === 'album') {
    imageUrl = item.images?.[0]?.url || imageUrl;
  } else if (itemType === 'track') {
    imageUrl = item.album?.images?.[0]?.url || imageUrl;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="w-20 h-20 flex-none flex flex-col items-center justify-center cursor-grab group relative overflow-hidden"
    >
      <img src={imageUrl} alt={itemName} className="w-full h-full object-cover aspect-square" />
      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded">
        <span className="text-white text-center text-sm p-1">{itemName}</span>
      </div>
    </div>
  );
};

export default TierItem;