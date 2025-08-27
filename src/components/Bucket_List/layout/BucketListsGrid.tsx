import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Music } from 'lucide-react';
import { getBucketLists, createBucketList } from '../../../services/Bucket_List/supabaseBucketList';
import { useAuth } from '../../../hooks/useAuth';

interface BucketList {
  id: string;
  name: string;
  created_at: string;
}

export function BucketListsGrid() {
  const [lists, setLists] = useState<BucketList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
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
      await createBucketList(newListName, user.id);
      console.log('handleCreateList: createBucketList call successful.');
      fetchLists();
      setNewListName('');
      setIsCreating(false);
    } catch (error) {
      console.error('handleCreateList: Error creating bucket list:', error);
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
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800 font-bold py-2 px-4 rounded-lg">
            Create
          </button>
        </form>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {lists.map((list) => (
          <Link to={list.id} key={list.id} className="bg-gray-200 dark:bg-neutral-900 hover:bg-gray-300 dark:hover:bg-neutral-800 transition-colors rounded-lg p-4 flex flex-col gap-4 group">
            <div className="relative w-full aspect-square bg-gray-300 dark:bg-neutral-800 rounded-md flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <Music size={48} className="text-gray-500 dark:text-neutral-500" />
            </div>
            <div>
              <p className="font-bold truncate">{list.name}</p>
              <p className="text-sm text-gray-500 dark:text-neutral-400">By You</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}