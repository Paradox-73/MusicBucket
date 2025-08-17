import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicBucketList } from '../services/Bucket_List/supabaseBucketList';
import { Music } from 'lucide-react';

// Define types for the list and its items
interface BucketListItem {
  id: string;
  title: string;
  imageUrl: string;
  artists: { name: string }[];
  type: 'artist' | 'album' | 'track';
}

interface PublicBucketList {
  id: string;
  name: string;
  created_at: string;
  items: BucketListItem[];
}

export function PublicBucketListPage() {
  const { listId } = useParams<{ listId: string }>();
  const [list, setList] = useState<PublicBucketList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (listId) {
      setLoading(true);
      getPublicBucketList(listId)
        .then(data => {
          setList(data);
          setError(null);
        })
        .catch(err => {
          console.error(err);
          setError('This bucket list is either private or does not exist.');
        })
        .finally(() => setLoading(false));
    }
  }, [listId]);

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (!list) {
    return null;
  }

  return (
    <div className="bg-black text-white min-h-screen p-8">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-32 h-32 bg-neutral-800 flex items-center justify-center">
                <Music size={64} className="text-neutral-500" />
            </div>
            <div>
                <h2 className="text-sm font-bold">Public Bucket List</h2>
                <h1 className="text-5xl font-extrabold">{list.name}</h1>
                <p className="text-neutral-400 mt-2">A collection of musical gems.</p>
            </div>
        </div>
      </header>

      <div className="flex flex-col gap-2">
        {list.items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 p-2 rounded-md hover:bg-white/10">
            <span className="text-neutral-400 text-right">{index + 1}</span>
            <div className="flex items-center gap-4">
              <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-cover" />
              <div>
                <p className="font-bold">{item.title}</p>
                <p className="text-sm text-neutral-400">{item.artists.map(a => a.name).join(', ')}</p>
              </div>
            </div>
            <span className="text-sm capitalize text-neutral-400">{item.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
