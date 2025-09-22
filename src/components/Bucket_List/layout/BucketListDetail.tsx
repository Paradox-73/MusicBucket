import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBucketLists, updateBucketList } from '../../../services/Bucket_List/supabaseBucketList';
import { useAuth } from '../../../hooks/useAuth';
import { useSpotifyStore } from '../../../store/Bucket_List/spotify';
import { SearchPanel } from './SearchPanel';
import { BucketListPanel } from './BucketListPanel';
import { ArrowLeft, Edit, Share2, Globe, Lock, Pencil, ArrowRight, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import CommentsSection from '../CommentsSection';
import CollaboratorsPanel from './CollaboratorsPanel';
import SmartSuggestions from '../SmartSuggestions';
import ThemePanel from './ThemePanel';
import ShareModal from '../ShareModal';
import SpotifyImport from '../SpotifyImport';

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
  const { setCurrentListId, loadListItems } = useSpotifyStore();

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
                    <SpotifyImport />
                </div>
                {/* Search Toggle Button */}
                <button
                  onClick={() => setIsSearchPanelCollapsed(!isSearchPanelCollapsed)}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  title={isSearchPanelCollapsed ? "Expand Search" : "Collapse Search"}
                >
                  <Search size={20} />
                </button>
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
          <BucketListPanel isSearchPanelCollapsed={isSearchPanelCollapsed} />
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
