import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBucketLists, updateBucketList } from '../../../services/Bucket_List/supabaseBucketList';
import { useAuth } from '../../../hooks/useAuth';
import { useSpotifyStore } from '../../../store/Bucket_List/spotify';
import { SearchPanel } from './SearchPanel';
import { BucketListPanel } from './BucketListPanel';
import { ArrowLeft, Edit, Share2, Globe, Lock, Pencil, ArrowRight, ChevronDown, ChevronUp, Search, X, SlidersHorizontal, Grid, List } from 'lucide-react';
import CommentsSection from '../CommentsSection';
import CollaboratorsPanel from './CollaboratorsPanel';
import SmartSuggestions from '../SmartSuggestions';
import ThemePanel from './ThemePanel';
import ShareModal from '../ShareModal';
import { Filters } from '../Filters';
import { useAuthStore } from '../../../store/authStore';
import { ReminderService } from '../../../services/ReminderService';


// Define the type for a single bucket list
interface BucketList {
  id: string;
  name: string;
  is_public: boolean;
  description?: string; // Added for bucket list description
}

export function BucketListDetail() {
  const { listId } = useParams<{ listId: string }>();
  const [list, setList] = useState<BucketList | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { items, setCurrentListId, loadListItems, removeItems, toggleListenedBulk, setSortOrder, sortOrder } = useSpotifyStore();

  // New state for renaming
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedListName, setEditedListName] = useState('');

  // New state for description
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

  // State for ShareModal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSearchPanelCollapsed, setIsSearchPanelCollapsed] = useState(false);
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); // State for mobile search overlay

  const [isListView, setIsListView] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [massSelectMode, setMassSelectMode] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none'); // Default to no reminders
  const [isReminderDropdownOpen, setIsReminderDropdownOpen] = useState(false);
  const [isActionsPopoverOpen, setIsActionsPopoverOpen] = useState(false); // New state for actions popover

  const { user: authUser } = useAuthStore();
  const userId = authUser?.id;

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

  useEffect(() => {
    if (user && listId) {
      setCurrentListId(listId);
      loadListItems(listId);
      fetchListDetails();
    }
  }, [user, listId, setCurrentListId, loadListItems]);

  useEffect(() => {
    if (list) {
      setEditedDescription(list.description || '');
    }
  }, [list]);

  const fetchListDetails = async () => {
    if (!user || !listId) return;
    setLoading(true);
    try {
      const allLists = await getBucketLists(user.id);
      const currentList = allLists.find(l => l.id === listId);
      setList(currentList || null);
    } catch (error) {
      console.error('Error fetching bucket list details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditingName = () => {
    if (list) {
      setIsEditingName(true);
      setEditedListName(list.name);
    }
  };

  const handleCancelEditingName = () => {
    setIsEditingName(false);
    if (list) {
      setEditedListName(list.name); // Reset to original name
    }
  };

  const handleSaveName = async () => {
    if (!list || !editedListName.trim()) {
      alert('List name cannot be empty.');
      return;
    }
    if (editedListName === list.name) {
      setIsEditingName(false); // No change, just exit editing
      return;
    }

    try {
      const updatedList = await updateBucketList(list.id, { name: editedListName });
      setList(updatedList); // Update the local state with the new name
      setIsEditingName(false); // Exit editing mode
    } catch (error) {
      console.error('Error renaming bucket list:', error);
      alert('Failed to rename list. Please try again.');
    }
  };

  const handleStartEditingDescription = () => {
    if (list) {
      setIsEditingDescription(true);
      setEditedDescription(list.description || '');
    }
  };

  const handleCancelEditingDescription = () => {
    setIsEditingDescription(false);
    if (list) {
      setEditedDescription(list.description || ''); // Reset to original description
    }
  };

  const handleSaveDescription = async () => {
    if (!list) {
      alert('Bucket list not found.');
      return;
    }

    try {
      const updatedList = await updateBucketList(list.id, { description: editedDescription.trim() });
      setList(updatedList); // Update the local state with the new description
      setIsEditingDescription(false); // Exit editing mode
    } catch (error) {
      console.error('Error updating bucket list description:', error);
      alert('Failed to update description. Please try again.');
    }
  };

  const handleTogglePublic = async () => {
    if (!list || !listId) return;
    try {
      const updatedList = await updateBucketList(listId, { is_public: !list.is_public });
      setList(updatedList);
    } catch (error) {
      console.error('Error updating bucket list:', error);
    }
  };

  const handleShare = () => {
    if (!list) return;
    setIsShareModalOpen(true);
  };

  const onRequestCollaborate = () => {
    // Implement collaboration request logic here
    alert('Collaboration request sent!');
    setIsShareModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 h-12 w-12"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading Bucket List details...</p>
        </div>
      </div>
    );
  }

  if (!list) {
    return <div>Bucket list not found.</div>;
  }

  return (
    <div className="flex h-full flex-col bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
        <header className="p-4 border-b border-gray-200 dark:border-white/10 flex flex-wrap justify-between items-center gap-2">
            <Link to=".." className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Back to My Lists</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
                {isEditingName ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={editedListName}
                            onChange={(e) => setEditedListName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSaveName();
                                }
                                if (e.key === 'Escape') {
                                    handleCancelEditingName();
                                }
                            }}
                            className="text-2xl font-bold p-1 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                            autoFocus
                        />
                        <button onClick={handleSaveName} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full">
                            Save
                        </button>
                        <button onClick={handleCancelEditingName} className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded-full">
                            Cancel
                        </button>
                    </div>
                ) : (
                    <h1 className="text-2xl font-bold">{list.name}</h1>
                )}
                {!isEditingName && (
                    <div className="flex items-center gap-2">
                        <button onClick={handleStartEditingName} className="text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                            <Pencil size={20} />
                        </button>
                        <button onClick={() => setIsDescriptionCollapsed(!isDescriptionCollapsed)} className="text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                            {isDescriptionCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button onClick={handleTogglePublic} className="flex items-center gap-1 text-sm">
                        {list.is_public ? <><Globe size={16} /> Public</> : <><Lock size={16} /> Private</>}
                    </button>
                    <button onClick={handleShare} className="flex items-center gap-1 text-sm bg-purple-600 px-3 py-1 rounded-full hover:bg-purple-700 text-white">
                        <Share2 size={16} /> Share
                    </button>
                    {/* Search Toggle Button */}
                    <button
                      onClick={() => setIsSearchPanelCollapsed(!isSearchPanelCollapsed)}
                      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                      title={isSearchPanelCollapsed ? "Expand Search" : "Collapse Search"}
                    >
                      <Search size={20} />
                    </button>
                    <div className="relative flex items-center gap-1">
                      <button
                        onClick={() => setIsActionsPopoverOpen(!isActionsPopoverOpen)}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        title="More Actions"
                      >
                        <SlidersHorizontal size={20} />
                      </button>

                      {/* Actions Popover */}
                      {isActionsPopoverOpen && (
                        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-md bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex flex-col p-2 gap-2">
                            <Filters />
                            {!massSelectMode ? (
                              <button
                                onClick={() => {
                                  setMassSelectMode(true);
                                  setIsActionsPopoverOpen(false);
                                }}
                                className="px-2 py-0.5 text-sm font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 w-full text-left"
                              >
                                Select
                              </button>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => {
                                    setMassSelectMode(false);
                                    setIsActionsPopoverOpen(false);
                                  }}
                                  className="px-2 py-0.5 text-sm font-medium rounded-md bg-gray-400 hover:bg-gray-500 text-white w-full text-left"
                                >
                                  Cancel Selection
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedItems(new Set(items.map(i => i.id)));
                                    setIsActionsPopoverOpen(false);
                                  }}
                                  className="px-2 py-0.5 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white w-full text-left"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedItems(new Set());
                                    setIsActionsPopoverOpen(false);
                                  }}
                                  className="px-2 py-0.5 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white w-full text-left"
                                >
                                  Deselect All
                                </button>
                              </div>
                            )}
                            {selectedItems.size > 0 && (
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => {
                                    handleBulkToggleListened();
                                    setIsActionsPopoverOpen(false);
                                  }}
                                  className="px-2 py-0.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 w-full text-left"
                                  title="Toggle Listen Status"
                                >
                                  Toggle Listen Status ({selectedItems.size})
                                </button>
                                <button
                                  onClick={() => {
                                    handleBulkDelete();
                                    setIsActionsPopoverOpen(false);
                                  }}
                                  className="px-2 py-0.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 w-full text-left"
                                  title="Delete Selected"
                                >
                                  Delete Selected ({selectedItems.size})
                                </button>
                              </div>
                            )}

                            {/* Reminder Frequency Dropdown in Popover */}
                            <div className="relative">
                              <button
                                onClick={() => setIsReminderDropdownOpen(!isReminderDropdownOpen)}
                                className="flex items-center justify-between px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white w-full text-left"
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
                                      setIsActionsPopoverOpen(false);
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
                                      setIsActionsPopoverOpen(false);
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
                                      setIsActionsPopoverOpen(false);
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

                            {/* Sort Order Button in Popover */}
                            <div className="flex items-center gap-2">
                              <button
                                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                  className="p-2 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white w-full text-left"
                              >
                                  Sort Order: {sortOrder === 'asc' ? 'Ascending' : 'Descending'} {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </div>

                            {/* Grid/List View Toggle in Popover */}
                            <div className="flex rounded-md shadow-sm w-full" role="group">
                              <button
                                type="button"
                                className={`px-3 py-1 text-sm font-medium rounded-l-md ${!isListView ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'} hover:bg-purple-700 dark:hover:bg-gray-600 focus:z-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-1/2`}
                                onClick={() => {
                                  setIsListView(false);
                                  setIsActionsPopoverOpen(false);
                                }}
                                title="Grid View"
                              >
                                <Grid size={16} /> Grid
                              </button>
                              <button
                                type="button"
                                className={`px-3 py-1 text-sm font-medium rounded-r-md ${isListView ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'} hover:bg-purple-700 dark:hover:bg-gray-600 focus:z-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-1/2`}
                                onClick={() => {
                                  setIsListView(true);
                                  setIsActionsPopoverOpen(false);
                                }}
                                title="List View"
                              >
                                <List size={16} /> List
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                </div>
            </div>
        </header>

        {!isDescriptionCollapsed && (
            <section className="p-4 sm:p-6 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-lg mb-8">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold">Description</h2>
                    {!isEditingDescription && (
                        <button onClick={handleStartEditingDescription} className="text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                            <Pencil size={20} />
                        </button>
                    )}
                </div>
                {isEditingDescription ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) { // Allow Shift+Enter for new line
                                    e.preventDefault();
                                    handleSaveDescription();
                                }
                                if (e.key === 'Escape') {
                                    handleCancelEditingDescription();
                                }
                            }}
                            className="w-full p-2 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                            rows={4}
                            placeholder="Add a description for your bucket list..."
                            autoFocus
                        ></textarea>
                        <div className="flex justify-end gap-2">
                            <button onClick={handleSaveDescription} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md">
                                Save
                            </button>
                            <button onClick={handleCancelEditingDescription} className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-md">
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {list.description || "No description yet. Click the pencil icon to add one!"}
                    </p>
                )}
            </section>
        )}

      <main className="flex flex-1 overflow-y-auto">
        {/* Search Panel */}
        <div className={`${isSearchPanelCollapsed ? 'w-0 overflow-hidden' : 'w-full md:w-1/3 lg:w-1/4'} transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-white/10 flex flex-col`}>
          <SearchPanel listId={listId!} isCollapsed={isSearchPanelCollapsed} />
        </div>

        {/* Main Bucket List Content */}
        <div className="flex-1">
          <BucketListPanel 
            isSearchPanelCollapsed={isSearchPanelCollapsed}
            isListView={isListView}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            massSelectMode={massSelectMode}
            setMassSelectMode={setMassSelectMode}
          />
        </div>
      </main>
      {/* <CommentsSection listId={listId!} /> */}
      <CollaboratorsPanel listId={listId!} />
      {/* <SmartSuggestions listId={listId!} /> */}
      {/* <ThemePanel /> */}

      {list && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareUrl={`${window.location.origin}/bucketlist/share/${list.id}`}
          listName={list.name}
          ownerName={user?.email || 'Unknown'}
          listId={list.id}
        />
      )}
    </div>
  );
}
