import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBucketLists, updateBucketList } from '../../../services/Bucket_List/supabaseBucketList';
import { useAuth } from '../../../hooks/useAuth';
import { useSpotifyStore } from '../../../store/Bucket_List/spotify';
import { SearchPanel } from './SearchPanel';
import { BucketListPanel } from './BucketListPanel';
import { ArrowLeft, Edit, Share2, Globe, Lock } from 'lucide-react';

// Define the type for a single bucket list
interface BucketList {
  id: string;
  name: string;
  is_public: boolean;
}

export function BucketListDetail() {
  const { listId } = useParams<{ listId: string }>();
  const [list, setList] = useState<BucketList | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { setCurrentListId, loadListItems } = useSpotifyStore();

  useEffect(() => {
    if (user && listId) {
      setCurrentListId(listId);
      loadListItems(listId);
      fetchListDetails();
    }
  }, [user, listId, setCurrentListId, loadListItems]);

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
    const shareUrl = `${window.location.origin}/bucketlist/share/${list.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!');
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!list) {
    return <div>Bucket list not found.</div>;
  }

  return (
    <div className="flex h-full flex-col bg-black text-white">
        <header className="p-4 border-b border-white/10 flex justify-between items-center">
            <Link to=".." className="flex items-center gap-2 hover:text-purple-400 transition-colors">
                <ArrowLeft size={20} />
                Back to My Lists
            </Link>
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">{list.name}</h1>
                <button onClick={handleTogglePublic} className="flex items-center gap-1 text-sm">
                    {list.is_public ? <><Globe size={16} /> Public</> : <><Lock size={16} /> Private</>}
                </button>
                <button onClick={handleShare} className="flex items-center gap-1 text-sm bg-purple-600 px-3 py-1 rounded-full hover:bg-purple-700">
                    <Share2 size={16} /> Share
                </button>
            </div>
        </header>
      <main className="grid flex-1 grid-cols-12 overflow-hidden">
        <div className="col-span-5 border-r border-white/10 xl:col-span-4">
          <SearchPanel listId={listId!} />
        </div>
        <div className="col-span-7 xl:col-span-8">
          <BucketListPanel />
        </div>
      </main>
    </div>
  );
}