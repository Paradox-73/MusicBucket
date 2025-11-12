import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Music } from 'lucide-react';
import { getBucketLists, createBucketList, deleteBucketList, updateBucketList, uploadBucketListCover } from '../../../services/Bucket_List/supabaseBucketList';
import { useAuth } from '../../../hooks/useAuth';
import DiscoveryMode from '../DiscoveryMode';
import { BucketListCard } from './BucketListCard';

interface BucketListItemForGrid {
  imageUrl?: string;
}

interface BucketList {
  id: string;
  name: string;
  created_at: string;
  items?: BucketListItemForGrid[];
  cover_image_url?: string;
  description?: string;
}

export function BucketListsGrid() {
  const [lists, setLists] = useState<BucketList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [listNameError, setListNameError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDiscoveryModeOpen, setIsDiscoveryModeOpen] = useState(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newListName.trim()) {
      setListNameError('List title is required.');
      return;
    }
    setListNameError(''); // Clear any previous error

    if (!user) {
      alert('User not authenticated.');
      return;
    }

    try {
      const userBucketLists = await getBucketLists(user.id);
      const existingList = userBucketLists.find(bList => bList.name === newListName);

      if (existingList) {
        alert(`You already have a bucket list named "${newListName}".`);
        return;
      }

      const newBucketList = await createBucketList(newListName, user.id);

      if (selectedFile && newBucketList) {
        const coverImageUrl = await uploadBucketListCover(selectedFile, user.id, newBucketList.id);
        await updateBucketList(newBucketList.id, { cover_image_url: coverImageUrl });
      }

      setNewListName('');
      setSelectedFile(null);
      setIsCreating(false);

      navigate(`/bucket-list/${newBucketList.id}`);
    } catch (error) {
      console.error('Error creating bucket list:', error);
      alert('Failed to create list. Please try again.');
    }
  };

  const handleRenameList = async (listId: string, newName: string) => {
    try {
      await updateBucketList(listId, { name: newName });
      fetchLists();
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

  const handleCoverUpdate = (listId: string, newCoverUrl: string) => {
    setLists(lists.map(l => l.id === listId ? { ...l, cover_image_url: newCoverUrl } : l));
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
          <div className="flex-grow">
            <input
              ref={inputRef}
              type="text"
              value={newListName}
              onChange={(e) => {
                setNewListName(e.target.value);
                if (listNameError) setListNameError(''); // Clear error on change
              }}
              placeholder="Enter list name..."
              className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 py-2 px-4 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-500"
            />
            {listNameError && <p className="text-red-500 text-sm mt-1">{listNameError}</p>}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex-grow rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 py-2 px-4 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-500"
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800 font-bold py-2 px-4 rounded-lg">
            Create
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreating(false);
              setNewListName('');
              setListNameError(''); // Clear error on cancel
            }}
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
          <BucketListCard
            key={list.id}
            list={list}
            onDelete={handleDeleteList}
            onRename={handleRenameList}
            onCoverUpdate={handleCoverUpdate}
          />
        ))}
      </div>
    </div>
  );
}
