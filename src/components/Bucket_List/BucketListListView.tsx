import React, { useState } from 'react';
import { Check, Trash2, FileText } from 'lucide-react';
import { useSpotifyStore } from '../../store/Bucket_List/spotify';

interface BucketListListViewProps {
  items: any[]; // Replace with actual item type
  selectedItems: Set<string>;
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const BucketListListView: React.FC<BucketListListViewProps> = ({ items, selectedItems, setSelectedItems }) => {
  const { toggleListened, removeItem, updateNotes } = useSpotifyStore();
  const [editingNotesItemId, setEditingNotesItemId] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState('');

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

  const handleEditNotesClick = (itemId: string, notes: string | undefined) => {
    setEditingNotesItemId(itemId);
    setCurrentNotes(notes || '');
  };

  const handleSaveNotes = async (itemId: string) => {
    await updateNotes(itemId, currentNotes);
    setEditingNotesItemId(null);
    setCurrentNotes('');
  };

  const handleCancelNotes = () => {
    setEditingNotesItemId(null);
    setCurrentNotes('');
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
            <div className="flex-grow">
              <h3 className="font-bold text-base sm:text-lg">{item.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.artists ? item.artists.join(', ') : ''}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{item.type}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleListened(item.id)}
                className={`rounded-full p-2 transition-colors ${item.completed
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-200/50 dark:bg-black/50 text-gray-600 dark:text-gray-300 hover:bg-green-500/20 hover:text-green-400'
                  }`}
                title={item.completed ? "Mark as unlistened" : "Mark as listened"}
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEditNotesClick(item.id, item.notes)}
                className={`rounded-full p-2 transition-colors ${item.notes
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-gray-200/50 dark:bg-black/50 text-gray-600 dark:text-gray-300 hover:bg-blue-500/20 hover:text-blue-400'
                  }`}
                title={item.notes ? "Edit notes" : "Add notes"}
              >
                <FileText className="h-4 w-4" />
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="rounded-full bg-gray-200/50 dark:bg-black/50 p-2 text-gray-600 dark:text-gray-300 transition-colors hover:bg-red-500/20 hover:text-red-400"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BucketListListView;