import React, { useState } from 'react';

interface TierSettingsPopoverProps {
  x: number;
  y: number;
  tierId: string;
  currentLabel: string;
  currentColor: string;
  onClose: () => void;
  onUpdateLabel: (tierId: string, newLabel: string) => void;
  onUpdateColor: (tierId: string, newColor: string) => void;
}

const TierSettingsPopover: React.FC<TierSettingsPopoverProps> = ({
  x, y, tierId, currentLabel, currentColor, onClose, onUpdateLabel, onUpdateColor
}) => {
  const [newLabel, setNewLabel] = useState(currentLabel);
  const [newColor, setNewColor] = useState(currentColor);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLabel(e.target.value);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewColor(e.target.value);
  };

  const handleSave = () => {
    if (newLabel !== currentLabel) {
      onUpdateLabel(tierId, newLabel);
    }
    if (newColor !== currentColor) {
      onUpdateColor(tierId, newColor);
    }
    onClose();
  };

  return (
    <div
      className="absolute z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md p-4 w-64"
      style={{ top: y, left: x }}
      onMouseLeave={onClose} // Close when mouse leaves the popover
    >
      <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Tier Settings</h3>
      <div className="mb-3">
        <label htmlFor="tier-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Label:</label>
        <input
          type="text"
          id="tier-label"
          value={newLabel}
          onChange={handleLabelChange}
          className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="tier-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color:</label>
        <input
          type="color"
          id="tier-color"
          value={newColor}
          onChange={handleColorChange}
          className="mt-1 block w-full h-10 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Save
      </button>
    </div>
  );
};

export default TierSettingsPopover;