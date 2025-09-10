import React, { useEffect, useState } from 'react';
import { Check, Trash2, ExternalLink, FileText } from 'lucide-react';
import { useSpotifyStore } from '../../store/Bucket_List/spotify';
import { SpotifyItem } from '../../types/Bucket_List/spotify';
import { useAuthStore } from '../../store/authStore';
import { ReminderService } from '../../services/ReminderService';

const CATEGORIES = ['artist', 'album', 'track', 'playlist', 'podcast'] as const;

const getSpotifyUrl = (item: SpotifyItem) => {
  const baseUrl = 'https://open.spotify.com';
  return `${baseUrl}/${item.type}/${item.spotify_id}`;
};

interface BucketListProps {
  items: SpotifyItem[];
  selectedItems: Set<string>;
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function BucketList({ items, selectedItems, setSelectedItems }: BucketListProps) {
  const { sortBy, toggleListened, removeItem, updateNotes, reorderItems } = 
    useSpotifyStore();

  const [editingNotesItemId, setEditingNotesItemId] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState('');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // NEW STATE FOR WHOLE BUCKET LIST REMINDER
  const [bucketListReminder, setBucketListReminder] = useState<'none' | 'weekly' | 'monthly'>('none');

  const { user } = useAuthStore();
  const userId = user?.id;

  // NEW EFFECT TO FETCH WHOLE BUCKET LIST REMINDER STATUS
  useEffect(() => {
    const fetchBucketListReminder = async () => {
      if (!userId) return;
      const status = await ReminderService.getReminderStatus(userId);
      if (status) {
        setBucketListReminder(status.frequency as 'none' | 'weekly' | 'monthly');
      } else {
        setBucketListReminder('none');
      }
    };
    fetchBucketListReminder();
  }, [userId]); // Depend only on userId

  // NEW HANDLER FOR WHOLE BUCKET LIST REMINDER CHANGES
  const handleBucketListReminderChange = async (frequency: 'weekly' | 'monthly' | 'none') => {
    if (!userId) {
      console.error("User not logged in.");
      return;
    }
    try {
      await ReminderService.updateReminderFrequency(userId, frequency);
      setBucketListReminder(frequency);
    } catch (error) {
      console.error("Failed to update bucket list reminder:", error);
    }
  };

  // NEW HANDLER FOR "REMIND ME NOW" BUTTON
  const handleRemindMeNow = async () => {
    if (!userId) {
      console.error("User not logged in.");
      return;
    }
    try {
      await ReminderService.sendTestReminder(userId);
      alert("Test reminder simulated! Check console and Supabase 'last_sent_at'.");
    } catch (error) {
      console.error("Failed to simulate test reminder:", error);
      alert("Failed to simulate test reminder.");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'completed') {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    }
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetItemId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetItemId) {
      return;
    }

    const currentItems = [...items];
    const draggedItemIndex = currentItems.findIndex(item => item.id === draggedItemId);
    const targetItemIndex = currentItems.findIndex(item => item.id === targetItemId);

    if (draggedItemIndex === -1 || targetItemIndex === -1) {
      return;
    }

    const [draggedItem] = currentItems.splice(draggedItemIndex, 1);
    currentItems.splice(targetItemIndex, 0, draggedItem);

    const newOrderedItems = currentItems.map((item, index) => ({
      ...item,
      position: index,
    }));

    reorderItems(newOrderedItems);
    setDraggedItemId(null);
  };

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

  const itemsByCategory = CATEGORIES.reduce((acc, category) => {
    acc[category] = sortedItems.filter((item) => item.type === category);
    return acc;
  }, {} as Record<typeof CATEGORIES[number], SpotifyItem[]>);

  return (
    <div className="space-y-8">
      {/* NEW: Whole Bucket List Reminder Controls */}
      <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
        <label htmlFor="bucketListReminder" className="text-lg font-semibold text-gray-900 dark:text-white">
          Bucket List Reminders:
        </label>
        <select
          id="bucketListReminder"
          className="p-2 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
          value={bucketListReminder}
          onChange={(e) => handleBucketListReminderChange(e.target.value as 'weekly' | 'monthly' | 'none')}
        >
          <option value="none">No Reminders</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button
          onClick={handleRemindMeNow}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-colors"
        >
          Remind Me Now (Dev)
        </button>
      </div>

      {CATEGORIES.map((category) => {
        const categoryItems = itemsByCategory[category];
        if (categoryItems.length === 0) return null;

        return (
          <div key={category} className="">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold capitalize text-gray-900 dark:text-white">{category}s</h2>
              <span className="rounded-full bg-gray-200 dark:bg-white/10 px-3 py-1 text-sm font-medium text-gray-900 dark:text-white">
                {categoryItems.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categoryItems.map((item) => {
                const handleCardClick = (e: React.MouseEvent) => {
                  if (!(e.target as HTMLElement).closest('input[type="checkbox"]')) {
                    window.open(getSpotifyUrl(item), '_blank');
                  }
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

                const isArtist = item.type === 'artist';

                return (
                  <div
                    key={item.id}
                    className={`group relative cursor-grab overflow-hidden transition-all duration-300 ease-in-out ${isArtist ? '' : 'rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:border-purple-500/50 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                    onClick={handleCardClick}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item.id)}
                  >
                    <input
                      type="checkbox"
                      className="absolute top-2 left-2 z-10 w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleCheckboxChange(item.id)}
                      onClick={(e) => e.stopPropagation()} // Prevent card click when checkbox is clicked
                    />
                    <div className="flex justify-center p-4">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                          item.type === 'artist'
                            ? 'h-32 w-32 rounded-full'
                            : 'h-32 sm:h-40 w-full rounded-md'
                        }`}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                    <div className={`absolute bottom-0 left-0 right-0 p-4 ${item.type === 'artist' ? 'text-center' : ''}`}>
                      <h3 className="truncate font-bold text-gray-900 dark:text-white" title={item.name}>{item.name}</h3>
                      {item.artists && (
                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                          {item.artists.join(', ')}
                        </p>
                      )}
                      {item.notes && editingNotesItemId !== item.id && ( // Display notes if present and not editing
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 line-clamp-2" title={item.notes}>
                          {item.notes}
                        </p>
                      )}
                    </div>

                    {editingNotesItemId === item.id && (
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gray-100 dark:bg-gray-800 z-10">
                        <textarea
                          className="w-full p-2 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm"
                          placeholder="Add your notes here..."
                          value={currentNotes}
                          onChange={(e) => setCurrentNotes(e.target.value)}
                          rows={3}
                          autoFocus
                        ></textarea>
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSaveNotes(item.id); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCancelNotes(); }}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-md text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div 
                      className="absolute top-2 right-2 flex items-center space-x-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300"
                      onClick={(e) => e.stopPropagation()} // Prevent card click when interacting with buttons
                    >
                      
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

                    {/* Status Tag */}
                    {item.completed && (
                       <div className="absolute left-2 top-2 rounded-full bg-green-500/20 px-2 py-1 text-xs font-bold text-green-300">
                         LISTENED
                       </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}