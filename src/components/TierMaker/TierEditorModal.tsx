import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Tier {
  id: string;
  label: string;
  color: string;
  rank: number;
}

interface TierEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tiers: Tier[];
  onSave: (updatedTiers: Tier[]) => void;
}

interface SortableTierRowProps {
  tier: Tier;
  onLabelChange: (id: string, newLabel: string) => void;
  onColorChange: (id: string, newColor: string) => void;
  onRemove: (id: string) => void;
}

const SortableTierRow: React.FC<SortableTierRowProps> = ({ tier, onLabelChange, onColorChange, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tier.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center space-x-2 mb-2 p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
      <div {...listeners} className="cursor-grab p-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <input
        type="text"
        value={tier.label}
        onChange={(e) => onLabelChange(tier.id, e.target.value)}
        className="flex-grow p-1 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      />
      <input
        type="color"
        value={tier.color}
        onChange={(e) => onColorChange(tier.id, e.target.value)}
        className="w-10 h-10 border rounded cursor-pointer"
      />
      <button onClick={() => onRemove(tier.id)} className="bg-red-500 hover:bg-red-700 text-white p-2 rounded">
        Remove
      </button>
    </div>
  );
};

const TierEditorModal: React.FC<TierEditorModalProps> = ({ isOpen, onClose, tiers, onSave }) => {
  const [editedTiers, setEditedTiers] = useState<Tier[]>([]);

  useEffect(() => {
    // Deep copy tiers to avoid direct mutation of props
    setEditedTiers(tiers.map(tier => ({ ...tier })));
  }, [tiers, isOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setEditedTiers((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = [...items];
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);
        return newItems.map((tier, index) => ({ ...tier, rank: index })); // Update ranks after reorder
      });
    }
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    setEditedTiers((prev) =>
      prev.map((tier) => (tier.id === id ? { ...tier, label: newLabel } : tier))
    );
  };

  const handleColorChange = (id: string, newColor: string) => {
    setEditedTiers((prev) =>
      prev.map((tier) => (tier.id === id ? { ...tier, color: newColor } : tier))
    );
  };

  const handleRemoveTier = (id: string) => {
    setEditedTiers((prev) => prev.filter((tier) => tier.id !== id));
  };

  const handleAddTier = () => {
    const newId = `tier-${editedTiers.length + 1}`;
    setEditedTiers((prev) => [
      ...prev,
      { id: newId, label: `New Tier ${editedTiers.length + 1}`, color: '#CCCCCC', rank: prev.length, items: [] },
    ]);
  };

  const handleSave = () => {
    onSave(editedTiers);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Tiers</h2>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={editedTiers.map(tier => tier.id)} strategy={verticalListSortingStrategy}>
            <div className="max-h-80 overflow-y-auto mb-4">
              {editedTiers.map((tier) => (
                <SortableTierRow
                  key={tier.id}
                  tier={tier}
                  onLabelChange={handleLabelChange}
                  onColorChange={handleColorChange}
                  onRemove={handleRemoveTier}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button onClick={handleAddTier} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4">
          Add New Tier
        </button>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TierEditorModal;
