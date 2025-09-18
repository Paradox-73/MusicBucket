import React, { useState, useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Settings, ChevronUp, ChevronDown } from 'lucide-react';

interface TierRowProps {
  id: string;
  label: string;
  color: string;
  children?: React.ReactNode;
  isDragging: boolean;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onLabelChange: (id: string, newLabel: string) => void;
  onColorChange: (id: string, newColor: string) => void;
  onRemove: (id: string) => void;
}

const TierRow: React.FC<TierRowProps> = ({
  id,
  label,
  color,
  children,
  isDragging,
  onMoveUp,
  onMoveDown,
  onLabelChange,
  onColorChange,
  onRemove,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(label);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  const handleLabelSave = () => {
    onLabelChange(id, editedLabel);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`relative flex min-h-[100px] mb-2 rounded-lg shadow-md overflow-hidden ${isOver ? 'ring-4 ring-blue-500' : ''}`}>
      <div className="flex-shrink-0 w-24 bg-black text-white text-2xl font-bold p-4 text-center flex justify-center items-center">
        {isEditing ? (
          <textarea
            value={editedLabel}
            onChange={(e) => setEditedLabel(e.target.value)}
            onBlur={handleLabelSave}
            className="w-full bg-transparent border-none text-2xl font-bold text-center resize-none focus:ring-0"
            autoFocus
            rows={Math.max(2, editedLabel.split('\n').length)}
          />
        ) : (
          <span onDoubleClick={() => setIsEditing(true)} className="w-full break-words">{label}</span>
        )}
      </div>
      <div style={{ backgroundColor: color }} className="flex flex-wrap gap-2 flex-grow p-2">
        {children}
      </div>
      {!isDragging && (
        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center bg-gray-800 bg-opacity-50 p-2">
          <button onClick={() => onMoveUp(id)} className="text-white hover:text-gray-300">
            <ChevronUp className="w-6 h-6" />
          </button>
          <div className="relative" ref={settingsMenuRef}>
            <button onClick={() => setIsSettingsOpen(prev => !prev)} className="text-white hover:text-gray-300 my-1">
              <Settings className="w-6 h-6" />
            </button>
            <div className={`absolute right-full top-1/2 -translate-y-1/2 w-40 bg-gray-900 text-white rounded-md shadow-lg p-2 ${isSettingsOpen ? 'block' : 'hidden'} z-10 mr-2`}>
              <p className="text-sm font-bold mb-2">Tier Settings</p>
              <label className="flex items-center space-x-2 cursor-pointer">
                <span className="text-sm">Color:</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onColorChange(id, e.target.value)}
                  className="w-8 h-8 border-none cursor-pointer"
                />
              </label>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setIsSettingsOpen(false);
                }}
                className="w-full text-left px-2 py-1 mt-2 text-sm rounded hover:bg-gray-700"
              >
                Rename Tier
              </button>
              <button
                onClick={() => {
                  onRemove(id);
                  setIsSettingsOpen(false);
                }}
                className="w-full text-left px-2 py-1 mt-1 text-sm rounded hover:bg-gray-700 text-red-500"
              >
                Delete Tier
              </button>
            </div>
          </div>
          <button onClick={() => onMoveDown(id)} className="text-white hover:text-gray-300">
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TierRow;
