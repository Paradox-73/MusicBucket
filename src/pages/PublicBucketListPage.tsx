import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicBucketList, createBucketList, addItemToBucketList, getBucketLists } from '../services/Bucket_List/supabaseBucketList';
import { Music, Twitter, Copy, Save, Whatsapp, Instagram } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ThemeToggle';

// Define types for the list and its items
interface BucketListItem {
  id: string;
  title: string;
  imageUrl: string;
  artists: { name: string }[];
  type: 'artist' | 'album' | 'track';
  spotify_id?: string; // Added Spotify ID
}

interface PublicBucketList {
  id: string;
  name: string;
  created_at: string;
  creator_name?: string; // Added creator's name
  items: BucketListItem[];
}

export function PublicBucketListPage() {
  console.log('PublicBucketListPage: Component rendered.');
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<PublicBucketList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    console.log('PublicBucketListPage: useEffect triggered. id:', id);
    if (id) {
      setLoading(true);
      getPublicBucketList(id)
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
  }, [id]);

  const handleSaveList = async () => {
    if (!user || !list) {
      alert('Please log in to save this list.');
      return;
    }

    try {
      // Check if a list with the same name already exists for the user
      const userBucketLists = await getBucketLists(user.id);
      const existingList = userBucketLists.find(bList => bList.name === list.name);

      if (existingList) {
        alert(`You already have a bucket list named "${list.name}".`);
        return;
      }

      // 1. Create a new bucket list for the user
      const newBucketList = await createBucketList(list.name, user.id);

      // 2. Add all items from the public list to the new list
      for (const item of list.items) {
        await addItemToBucketList({
          user_id: user.id,
          name: item.title,
          imageUrl: item.imageUrl,
          artists: item.artists,
          type: item.type,
          completed: false, // Assuming new items are not completed
          spotify_id: item.spotify_id || '',
        }, newBucketList.id);
      }

      alert('List saved to your account!');
      // Optionally, redirect to the user's bucket lists page
      // navigate('/my-bucketlists');
    } catch (error) {
      console.error('Error saving list:', error);
      alert('Failed to save list. Please try again.');
    }
  };

  const handleShareTwitter = () => {
    if (!list) return;
    const tweetText = `Check out this awesome music bucket list: "${list.name}" on MusicBucket!`;
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Share link copied to clipboard!');
    });
  };

  const handleShareWhatsapp = () => {
    if (!list) return;
    const text = `Check out this awesome music bucket list: "${list.name}" on MusicBucket! ${window.location.href}`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareInstagram = () => {
    // Instagram's web sharing capabilities are very limited. Direct sharing to stories/DM with pre-filled content
    // is not reliably supported from web applications. The best we can do is attempt to open the Instagram app
    // or prompt the user to copy the link.
    const url = window.location.href;
    const instagramShareUrl = `instagram://sharesheet?text=${encodeURIComponent(url)}`;

    // Try to open the Instagram app
    window.open(instagramShareUrl, '_blank');

    // Fallback for desktop or if app doesn't open
    setTimeout(() => {
      alert('If Instagram app did not open, please copy the link and paste it in your Instagram story or post: ' + url);
      navigator.clipboard.writeText(url);
    }, 500);
  };

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
    <div className="bg-gray-100 dark:bg-black text-gray-900 dark:text-white min-h-screen p-8">
      <header className="relative mb-8 p-6 rounded-lg shadow-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white overflow-hidden">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        {list.items && list.items.length > 0 && list.items[0].imageUrl && (
          <img
            src={list.items[0].imageUrl}
            alt="Bucket list cover"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
        )}
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-24 h-24 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
            {list.items && list.items.length > 0 && list.items[0].imageUrl ? (
              <img src={list.items[0].imageUrl} alt={list.items[0].title} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <Music size={48} className="text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Public Bucket List</h2>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-1">{list.name}</h1>
            {list.creator_name && <p className="text-gray-600 dark:text-gray-300 text-lg">by {list.creator_name}</p>}
            <p className="text-gray-700 dark:text-gray-200 mt-2 text-lg">A curated collection of musical gems shared with you.</p>
            <div className="mt-4 flex gap-3">
              {user ? (
                <button
                  onClick={handleSaveList}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Save size={20} /> Save This List
                </button>
              ) : (
                <button
                  onClick={() => alert('Please log in to save this list.')} // Placeholder for login prompt
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Save size={20} /> Log in to Save
                </button>
              )}
              <button
                onClick={handleShareTwitter}
                className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
              >
                <Twitter size={20} /> Share on Twitter
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
              >
                <Copy size={20} /> Copy Link
              </button>
              <button
                onClick={handleShareWhatsapp}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                <Share2 size={20} /> WhatsApp
              </button>
              <button
                onClick={handleShareInstagram}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
              >
                <Instagram size={20} /> Instagram
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-2">
        {list.items && list.items.length > 0 ? (
          list.items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 p-4 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow duration-200">
              <span className="text-gray-700 dark:text-gray-300 font-semibold text-left">{index + 1}.</span>
              <div className="flex items-center gap-4">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded-md" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                    <Music size={32} className="text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.artists?.map(a => a.name).join(', ')}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-light/20 text-primary dark:bg-primary-dark/50 dark:text-primary-light capitalize">{item.type}</span>
              {item.spotify_id && (
                <a
                  href={`https://open.spotify.com/${item.type === 'track' ? 'track' : 'artist'}/${item.spotify_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                  aria-label="Listen on Spotify"
                >
                  <Music size={20} />
                </a>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-neutral-400 mt-8">
            This bucket list is empty.
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicBucketListPage;