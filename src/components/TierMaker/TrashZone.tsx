import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface TrashZoneProps {
  id: string;
}

const TrashZone: React.FC<TrashZoneProps> = ({ id }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-lg text-gray-500 dark:text-gray-400 transition-colors duration-200
        ${isOver ? 'border-red-500 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}
      `}
    >
      {isOver ? 'Release to Remove' : 'Drag here to remove'}
    </div>
  );
};

export default TrashZone;