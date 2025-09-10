import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicBucketLists } from '../../services/Bucket_List/supabaseBucketList';

interface PublicBucketList {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  owner_id: string;
  owner_email: string;
}

export function PublicListShowcasesPage() {
  const [publicLists, setPublicLists] = useState<PublicBucketList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicLists = async () => {
      setLoading(true);
      try {
        const lists = await getPublicBucketLists();
        setPublicLists(lists);
      } catch (error) {
        console.error('Error fetching public bucket lists:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicLists();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading public lists...</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 dark:bg-black text-gray-900 dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Public Bucket List Showcases</h1>

      {publicLists.length === 0 ? (
        <div className="text-center p-10 bg-gray-200 dark:bg-neutral-900 rounded-lg shadow-md">
          <p className="text-xl font-semibold text-gray-700 dark:text-neutral-300 mb-4">No public lists available yet.</p>
          <p className="text-gray-600 dark:text-neutral-400">Be the first to share your musical journey!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {publicLists.map(list => (
            <Link to={`/bucketlist/share/${list.id}`} key={list.id} className="bg-gray-200 dark:bg-neutral-900 hover:bg-gray-300 dark:hover:bg-neutral-800 transition-colors rounded-lg p-4 flex flex-col gap-4 group relative">
              <div className="relative w-full aspect-square bg-gray-300 dark:bg-neutral-800 rounded-md flex items-center justify-center group-hover:shadow-lg transition-shadow overflow-hidden">
                {list.cover_image_url ? (
                  <img src={list.cover_image_url} alt={list.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-neutral-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3-2.25V4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold truncate">{list.name}</h3>
                <p className="text-sm text-gray-500 dark:text-neutral-400">By {list.owner_email}</p>
                {list.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{list.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}