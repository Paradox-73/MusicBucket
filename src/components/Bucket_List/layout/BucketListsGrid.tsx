import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Music, Trash2, Pencil } from 'lucide-react';
import { getBucketLists, createBucketList, deleteBucketList, updateBucketList, uploadBucketListCover } from '../../../services/Bucket_List/supabaseBucketList';
import { useAuth } from '../../../hooks/useAuth';
import DiscoveryMode from '../DiscoveryMode';

interface BucketListItemForGrid {
  imageUrl?: string;
}

interface BucketList {
  id: string;
  name: string;
  created_at: string;
  items?: BucketListItemForGrid[]; // Added items for image display
  cover_image_url?: string; // Re-added
  description?: string; // Added for bucket list description
}

export function BucketListsGrid() {
  const [lists, setLists] = useState<BucketList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Re-added
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editedListName, setEditedListName] = useState('');
  const [isDiscoveryModeOpen, setIsDiscoveryModeOpen] = useState(false); // New state for Discovery Mode
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchLists();
    }
  }, [user]);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const fetchLists = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const bucketLists = await getBucketLists(user.id);
      if (bucketLists) {
        setLists(bucketLists);
      }
    } catch (error) {
      console.error('Error fetching bucket lists after creation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewListName(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Re-added
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleCreateList: Attempting to create list.');
    console.log('handleCreateList: User:', user);
    console.log('handleCreateList: New List Name:', newListName);

    if (!user || !newListName.trim()) {
      console.log('handleCreateList: Validation failed. User or list name is empty.');
      return;
    }

    try {
      // Check if a list with the same name already exists for the user
      const userBucketLists = await getBucketLists(user.id);
      const existingList = userBucketLists.find(bList => bList.name === newListName);

      if (existingList) {
        alert(`You already have a bucket list named "${newListName}".`);
        return;
      }

      // 1. Create the bucket list
      const newBucketList = await createBucketList(newListName, user.id);

      // 2. If a file is selected, upload it and update the bucket list
      if (selectedFile && newBucketList) {
        const coverImageUrl = await uploadBucketListCover(selectedFile, user.id, newBucketList.id);
        await updateBucketList(newBucketList.id, { cover_image_url: coverImageUrl });
      }

      console.log('handleCreateList: createBucketList call successful.');
      setNewListName('');
      setSelectedFile(null); // Reset selected file
      setIsCreating(false);

      // Redirect to the newly created bucket list's detail page
      navigate(`/bucket-list/${newBucketList.id}`);
    } catch (error) {
      console.error('handleCreateList: Error creating bucket list:', error);
      alert('Failed to create list. Please try again.');
    }
  };

  const handleStartRename = (listId: string, currentName: string) => {
    setEditingListId(listId);
    setEditedListName(currentName);
  };

  const handleCancelRename = () => {
    setEditingListId(null);
    setEditedListName('');
  };

  const handleSaveRename = async (listId: string) => {
    if (!user || !editedListName.trim()) {
      alert('List name cannot be empty.');
      return;
    }

    try {
      await updateBucketList(listId, { name: editedListName });
      fetchLists(); // Refresh the list
      handleCancelRename(); // Exit editing mode
    } catch (error) {
      console.error('Error renaming bucket list:', error);
      alert('Failed to rename list. Please try again.');
    }
  };

  

  const handleDeleteList = async (listId: string, listName: string) => {
    if (!user) return;
    if (window.confirm(`Are you sure you want to delete the bucket list "${listName}"? This action cannot be undone.`)) {
      try {
        await deleteBucketList(listId);
        fetchLists();
      } catch (error) {
        console.error('Error deleting bucket list:', error);
        alert('Failed to delete list. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 h-12 w-12"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your Bucket Lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 dark:bg-black text-gray-900 dark:text-white min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">My Bucket Lists</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsDiscoveryModeOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 font-bold py-2 px-4 rounded-full transition-colors"
          >
            <Music size={20} />
            Discovery Mode
          </button>
          {!isCreating && (
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800 font-bold py-2 px-4 rounded-full transition-colors"
            >
              <PlusCircle size={20} />
              Create List
            </button>
          )}
        </div>
      </div>
      {isDiscoveryModeOpen && <DiscoveryMode isOpen={isDiscoveryModeOpen} onClose={() => setIsDiscoveryModeOpen(false)} />}
      {isCreating && (
        <form onSubmit={handleCreateList} className="mb-6 flex flex-col sm:flex-row gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newListName}
            onChange={handleInputChange}
            placeholder="Enter list name..."
            className="flex-grow rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 py-2 px-4 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-500"
            
          />
          <input // Re-added
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex-grow rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 py-2 px-4 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-500"
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800 font-bold py-2 px-4 rounded-lg">
            Create
          </button>
          <button
            type="button" // Important: Prevent form submission
            onClick={() => setIsCreating(false)}
            className="bg-gray-400 hover:bg-gray-500 text-white dark:bg-gray-600 dark:hover:bg-gray-700 font-bold py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
        </form>
      )}

      {!loading && lists.length === 0 && (
        <div className="text-center p-10 bg-gray-200 dark:bg-neutral-900 rounded-lg shadow-md flex flex-col items-center justify-center">
          <Music size={64} className="text-gray-400 dark:text-neutral-500 mb-4" />
          <p className="text-xl font-semibold text-gray-700 dark:text-neutral-300 mb-4">No Bucket Lists yet!</p>
          <p className="text-gray-600 dark:text-neutral-400 mb-6">Start your music discovery journey by creating your first list.</p>
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800 font-bold py-3 px-6 rounded-full transition-colors text-lg"
          >
            <PlusCircle size={24} />
            Create Your First List
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {lists.map((list) => (
          <div key={list.id} className="bg-gray-200 dark:bg-neutral-900 hover:bg-gray-300 dark:hover:bg-neutral-800 transition-colors rounded-lg p-4 flex flex-col gap-4 group relative">
            <Link to={list.id} className="flex flex-col gap-4 flex-grow">
              <div className="relative w-full aspect-square bg-gray-300 dark:bg-neutral-800 rounded-md flex items-center justify-center group-hover:shadow-lg transition-shadow overflow-hidden">
                {list.cover_image_url ? (
                  <img src={list.cover_image_url} alt={list.name} className="w-full h-full object-cover" />
                ) : list.items && list.items.length > 0 ? (
                  list.items.length < 4 ? (
                    <img src={list.items[0].imageUrl} alt={list.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                      {list.items.slice(0, 4).map((item, idx) => (
                        <img key={idx} src={item.imageUrl} alt={list.name} className="w-full h-full object-cover" />
                      ))}
                    </div>
                  )
                ) : (
                  <Music size={48} className="text-gray-500 dark:text-neutral-500" />
                )}
              </div>
              <div>
                {editingListId === list.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editedListName}
                      onChange={(e) => setEditedListName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveRename(list.id);
                        }
                        if (e.key === 'Escape') {
                          handleCancelRename();
                        }
                      }}
                      className="w-full p-2 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleSaveRename(list.id);
                        }}
                        className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-lg text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleCancelRename();
                        }}
                        className="flex-grow bg-gray-400 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="font-bold truncate">{list.name}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-neutral-400">By You</p>
              </div>
            </Link>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              {editingListId !== list.id && (
                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevent Link navigation
                    handleStartRename(list.id, list.name);
                  }}
                  className="p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  title="Rename Bucket List"
                >
                  <Pencil size={16} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault(); // Prevent Link navigation
                  handleDeleteList(list.id, list.name);
                }}
                className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                title="Delete Bucket List"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}