import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Music, Trash2 } from 'lucide-react';
import { getBucketLists, createBucketList, deleteBucketList, uploadBucketListCover, updateBucketList } from '../../../services/Bucket_List/supabaseBucketList';
import { useAuth } from '../../../hooks/useAuth';

interface BucketListItemForGrid {
  imageUrl?: string;
}

interface BucketList {
  id: string;
  name: string;
  created_at: string;
  items?: BucketListItemForGrid[]; // Added items for image display
  cover_image_url?: string; // Added cover image URL
}

export function BucketListsGrid() {
  const [lists, setLists] = useState<BucketList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

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
      console.error('Error fetching bucket lists:', error);
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
      fetchLists();
      setNewListName('');
      setSelectedFile(null);
      setIsCreating(false);
    } catch (error) {
      console.error('handleCreateList: Error creating bucket list:', error);
      alert('Failed to create list. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 dark:bg-black text-gray-900 dark:text-white min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">My Bucket Lists</h1>
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
      {isCreating && (
        <form onSubmit={handleCreateList} className="mb-6 flex flex-col sm:flex-row gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newListName}
            onChange={handleInputChange}
            placeholder="Enter list name..."
            className="flex-grow rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 py-2 px-4 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-500"
            onBlur={() => setIsCreating(false)} // Optional: hide on blur
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex-grow rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 py-2 px-4 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-500"
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800 font-bold py-2 px-4 rounded-lg">
            Create
          </button>
        </form>
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
                <p className="font-bold truncate">{list.name}</p>
                <p className="text-sm text-gray-500 dark:text-neutral-400">By You</p>
              </div>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevent Link navigation
                handleDeleteList(list.id, list.name);
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Delete Bucket List"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}