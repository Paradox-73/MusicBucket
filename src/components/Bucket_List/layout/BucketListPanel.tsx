import React, { useState, useEffect } from 'react';
import { Filters } from '../Filters';
import { BucketList } from '../BucketList';
import { useSpotifyStore } from '../../../store/Bucket_List/spotify';
import { SpotifyItem } from '../../../types/Bucket_List/spotify';
import { Music, List, Grid, ArrowDown, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react';
import BucketListListView from '../BucketListListView';
import { useAuthStore } from '../../../store/authStore';
import { ReminderService } from '../../../services/ReminderService';

export function BucketListPanel({ isSearchPanelCollapsed }: { isSearchPanelCollapsed: boolean }) {
  const { items, addItem, filter, itemTypeFilter, setSortBy, sortBy, sortOrder, setSortOrder, removeItems, toggleListenedBulk } = useSpotifyStore();
  const [isListView, setIsListView] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [massSelectMode, setMassSelectMode] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none'); // Default to no reminders
  const [isReminderDropdownOpen, setIsReminderDropdownOpen] = useState(false);

  const { user } = useAuthStore();
  const userId = user?.id;

  useEffect(() => {
    const fetchReminderStatus = async () => {
      if (userId) {
        const status = await ReminderService.getReminderStatus(userId);
        if (status) {
          setReminderFrequency(status.frequency);
        }
      }
    };
    fetchReminderStatus();
  }, [userId]);


  const filteredItems = items.filter((item) => {
    // Filter by completion status
    if (filter === 'listened') return item.completed;
    if (filter === 'not-listened') return !item.completed;

    // Filter by item type
    if (itemTypeFilter !== 'all' && item.type !== itemTypeFilter) return false;

    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name) * order;
    }
    if (sortBy === 'completed') {
      if (a.completed === b.completed) return 0;
      return (a.completed ? 1 : -1) * order;
    }
    if (sortBy === 'date') {
        return (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) * order;
    }
    if (a.position !== b.position) {
      return (a.position - b.position) * order;
    }
    return (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) * order;
  });

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData('text/plain')) as SpotifyItem;
    if (items.some((existing) => existing.spotify_id === item.id)) {
      return;
    }
    addItem(item);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedItems.size} selected items?`)) {
      removeItems(Array.from(selectedItems));
      setSelectedItems(new Set()); // Clear selection
    }
  };

  const handleBulkToggleListened = () => {
    if (selectedItems.size === 0) return;
    toggleListenedBulk(Array.from(selectedItems));
    setSelectedItems(new Set()); // Clear selection
  };

  return (
    <div className="flex h-full flex-col bg-gray-100 dark:bg-black/90" onDragOver={handleDragOver} onDrop={handleDrop}>
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 border-b border-gray-200 dark:border-white/10 px-4 py-3 sm:px-6 sm:py-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Bucket List</h2>
        <div className="flex items-center gap-2"> {/* New div to group filters and sort */}
          <Filters />
          {!massSelectMode ? (
            <button
              onClick={() => setMassSelectMode(true)}
              className="px-3 py-1 text-sm font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700"
            >
              Select
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMassSelectMode(false)}
                className="px-3 py-1 text-sm font-medium rounded-md bg-gray-400 hover:bg-gray-500 text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => setSelectedItems(new Set(items.map(i => i.id)))}
                className="px-3 py-1 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-3 py-1 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                Deselect All
              </button>
            </div>
          )}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkToggleListened}
                className="px-3 py-1 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                title="Toggle Listen Status"
              >
                Toggle ({selectedItems.size})
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                title="Delete Selected"
              >
                Delete ({selectedItems.size})
              </button>
            </div>
          )}

          {/* Reminder Frequency Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsReminderDropdownOpen(!isReminderDropdownOpen)}
              className="flex items-center justify-between px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white min-w-[120px]"
            >
              {reminderFrequency === 'none' ? 'Reminders' : reminderFrequency.charAt(0).toUpperCase() + reminderFrequency.slice(1)}
              {isReminderDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {isReminderDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600">
                <button
                  onClick={async () => {
                    setReminderFrequency('none');
                    setIsReminderDropdownOpen(false);
                    if (userId) {
                      await ReminderService.updateReminderFrequency(userId, 'none');
                    }
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  No Reminders
                </button>
                <button
                  onClick={async () => {
                    setReminderFrequency('weekly');
                    setIsReminderDropdownOpen(false);
                    if (userId) {
                      await ReminderService.updateReminderFrequency(userId, 'weekly');
                    }
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Weekly
                </button>
                <button
                  onClick={async () => {
                    setReminderFrequency('monthly');
                    setIsReminderDropdownOpen(false);
                    if (userId) {
                      await ReminderService.updateReminderFrequency(userId, 'monthly');
                    }
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Monthly
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            
            <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
            >
                {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </button>
          </div>
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-3 py-1 text-sm font-medium rounded-l-md ${!isListView ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'} hover:bg-purple-700 dark:hover:bg-gray-600 focus:z-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
              onClick={() => setIsListView(false)}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-sm font-medium rounded-r-md ${isListView ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'} hover:bg-purple-700 dark:hover:bg-gray-600 focus:z-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
              onClick={() => setIsListView(true)}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredItems.length > 0 ? (
          isListView ? (
            <BucketListListView items={sortedItems} selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
          ) : (
            <BucketList items={sortedItems} selectedItems={selectedItems} setSelectedItems={setSelectedItems} isSearchPanelCollapsed={isSearchPanelCollapsed} massSelectMode={massSelectMode} setMassSelectMode={setMassSelectMode} />
          )
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              {filter === 'listened' ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Get listening!</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">You haven't marked any items as listened yet.</p>
                </>
              ) : filter === 'not-listened' ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Congrats!</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">You've listened to everything in your bucket.</p>
                </>
              ) : (
                <>
                  <Music size={64} className="text-gray-400 dark:text-neutral-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your bucket is empty!</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Use the search panel on the left to find artists, albums, and tracks to add.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
