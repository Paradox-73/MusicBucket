import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicBucketList } from '../services/Bucket_List/supabaseBucketList'; // Import data fetching service
import BucketListItemCard from '../components/Bucket_List/BucketListItemCard'; // Import the new component

// Define types for the list and its items based on PublicBucketListPage.tsx
interface BucketListItem {
  id: string;
  title: string;
  imageUrl: string;
  artists: { name: string }[];
  type: 'artist' | 'album' | 'track';
  spotify_id?: string;
  notes?: string;
}

interface PublicBucketList {
  id: string;
  name: string;
  created_at: string;
  creator_name?: string;
  description?: string;
  items: BucketListItem[];
}

const ShareBucketListPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>(); // Renamed from 'id' to 'listId' for consistency with route
  const [bucketList, setBucketList] = useState<PublicBucketList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (listId) {
      setLoading(true);
      getPublicBucketList(listId) // Use the actual service to fetch data
        .then(data => {
          setBucketList(data);
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl" style={{ fontFamily: 'Playfair Display' }}>Loading your cozy bucket list...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800">
        <p className="text-xl" style={{ fontFamily: 'Playfair Display' }}>Error: {error}</p>
      </div>
    );
  }

  if (!bucketList) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl" style={{ fontFamily: 'Playfair Display' }}>No bucket list to display.</p>
      </div>
    );
  }

  // CSS for torn paper effect and general aesthetic
  // Using nb_paper1.jpg for background, polaroid frame.jpg for images, clear tape.jpg for tape
    const pageStyle = {
    minHeight: '100vh',
    fontFamily: 'Caveat', // Handwritten font
    color: '#333',
    position: 'relative',
    boxShadow: '0 0 20px rgba(0,0,0,0.3)', // Subtle shadow for depth
    backgroundColor: '#f8f5e8', // Aged paper color
    // Subtle crinkle effect
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 50%)`, // Slightly more crinkle effect
    backgroundSize: '100px 100px', // Small repeating pattern
    backgroundRepeat: 'repeat',
    // Simpler torn edge
    clipPath: 'polygon(0% 2%, 1% 0%, 99% 0%, 100% 2%, 100% 98%, 99% 100%, 1% 100%, 0% 98%)', // Re-adding a generic torn edge
  };

  const tapeStyle = {
    backgroundImage: `url('/assets/clear tape.jpg')`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '50px',
    height: '20px',
    position: 'absolute',
    top: '0',
    left: '0',
    transform: 'rotate(-5deg)', // Adjusted rotation for top-left
    zIndex: 2, // Ensure it's above other elements
  };

  

  return (
    <div style={pageStyle} className="flex flex-col items-center">
      {/* Removed the white square div */}
      <div
        className="relative w-full px-8 py-0" // Adjusted padding and width
        style={{
          backgroundColor: 'transparent', // Keep transparent to show pageStyle's background
          // Combine aged texture and lines
          backgroundImage: `
            linear-gradient(to bottom, #ccc 1px, transparent 1px),
            radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%),
            radial-gradient(circle at 90% 80%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 50%)
          `,
          backgroundSize: '100% 24px, 100% 100%, 100% 100%', // Line height, texture size
          backgroundRepeat: 'repeat-y, no-repeat, no-repeat', // Repeat lines vertically, no repeat for texture
          backgroundPosition: '0 0, 0 0, 0 0',
          lineHeight: '24px', // Match line height to background-size for text alignment
          boxShadow: '0 0 15px rgba(0,0,0,0.1)', // Subtle shadow for the paper block
          borderRadius: '8px', // Soften corners
          minHeight: '80vh', // Ensure it's tall enough
        }}
      >
        <div style={tapeStyle}></div> {/* Tape at the top of the content block */}
        {/* Coffee Ring Placeholder */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '2px solid rgba(100, 70, 50, 0.2)', // Subtle brown border
          boxShadow: 'inset 0 0 5px rgba(100, 70, 50, 0.1)', // Inner shadow for depth
          transform: 'rotate(10deg)', // Slight rotation
          zIndex: 1, // Ensure it's above the background but below text
        }}></div>
        {/* Doodle Placeholder (simple line) */}
        <div style={{
          position: 'absolute',
          top: '25%',
          right: '10%',
          width: '100px',
          height: '20px',
          background: 'linear-gradient(to right, #a0a0a0, transparent)', // Simple grey line
          transform: 'rotate(-5deg)', // Slight rotation
          zIndex: 1,
        }}></div>
        <h1 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: 'Caveat', lineHeight: '24px', paddingTop: '24px' }}>
          {bucketList.name} {/* Use bucketList.name */}
        </h1>
        {bucketList.description && ( // Conditionally render description
          <p className="text-center" style={{ fontFamily: 'Playfair Display', lineHeight: '24px', paddingTop: '22px' }}>
            {bucketList.description}
          </p>
        )}
        {!bucketList.description && ( // Fallback if no description
          <p className="text-center" style={{ fontFamily: 'Playfair Display', lineHeight: '24px', paddingTop: '22px' }}>
            A curated collection of musical gems shared with you.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ perspective: '1000px' }}>
          {bucketList.items.map((item) => (
            <BucketListItemCard key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            style={{ fontFamily: 'Playfair Display', boxShadow: '3px 3px 5px rgba(0,0,0,0.2)' }} // Button shadow
          >
            {copied ? 'Copied!' : 'Copy Share Link'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareBucketListPage;