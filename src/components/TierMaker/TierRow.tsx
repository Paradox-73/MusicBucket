import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface TierRowProps {
  id: string;
  label: string;
  color: string;
  children?: React.ReactNode;
}

const TierRow: React.FC<TierRowProps> = ({ id, label, color, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ backgroundColor: color }}
      className={`relative flex items-center min-h-[100px] p-2 mb-2 rounded shadow-md ${isOver ? 'ring-4 ring-blue-500' : ''}`}
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-800 dark:text-gray-100">
        {label}
      </div>
      <div className="flex flex-wrap gap-0 ml-20 w-full">
        {children}
      </div>
    </div>
  );
};

export default TierRow;