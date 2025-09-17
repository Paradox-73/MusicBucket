import React, { useState, useRef, useEffect } from 'react'; // Import useRef, useEffect

interface CustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (name: string, imageUrl: string) => void;
}

const CustomItemModal: React.FC<CustomItemModalProps> = ({
  isOpen, onClose, onAddItem
}) => {
  const [itemName, setItemName] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previouslyFocusedElement.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim()) {
      onAddItem(itemName.trim(), itemImageUrl.trim());
      setItemName('');
      setItemImageUrl('');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      ref={modalRef}
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
          aria-label="Close" // Add aria-label
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add Custom Item</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name:</label>
            <input
              type="text"
              id="item-name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="item-image-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL (optional):</label>
            <input
              type="url"
              id="item-image-url"
              value={itemImageUrl}
              onChange={(e) => setItemImageUrl(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomItemModal;