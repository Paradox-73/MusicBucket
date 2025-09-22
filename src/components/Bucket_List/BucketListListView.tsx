import React from 'react';

interface BucketListListViewProps {
  items: any[]; // Replace with actual item type
  selectedItems: Set<string>;
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const BucketListListView: React.FC<BucketListListViewProps> = ({ items, selectedItems, setSelectedItems }) => {
  const handleCheckboxChange = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-1 sm:space-y-4">
      {items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No items in this list yet.</p>
      ) : (
        items.map(item => (
          <div key={item.id} className="flex items-center gap-1 p-1 sm:gap-4 sm:p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <input
              type="checkbox"
              className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              checked={selectedItems.has(item.id)}
              onChange={() => handleCheckboxChange(item.id)}
            />
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-md" />
            )}
            <div>
              <h3 className="font-bold text-base sm:text-lg">{item.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.artists ? item.artists.join(', ') : ''}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{item.type}</p>
            </div>
            {/* Add more item details or actions here */}
          </div>
        ))
      )}
    </div>
  );
};

export default BucketListListView;