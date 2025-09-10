import React, { useState } from 'react';

interface BucketListItem {
  id: string;
  title: string;
  imageUrl: string;
  artists: { name: string }[];
  type: 'artist' | 'album' | 'track';
  spotify_id?: string;
  notes?: string;
}

interface BucketListItemCardProps {
  item: BucketListItem;
}

const BucketListItemCard: React.FC<BucketListItemCardProps> = ({ item }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSpotifyNavigation = () => {
    let spotifyUrl = '';
    if (item.type === 'artist') {
      spotifyUrl = `https://open.spotify.com/artist/${item.spotify_id}`;
    } else if (item.type === 'album') {
      spotifyUrl = `https://open.spotify.com/album/${item.spotify_id}`;
    } else if (item.type === 'track') {
      spotifyUrl = `https://open.spotify.com/track/${item.spotify_id}`;
    }
    if (spotifyUrl) {
      window.open(spotifyUrl, '_blank');
    }
  };

  const polaroidStyle = {
    backgroundColor: 'white', // Pure CSS polaroid background
    padding: '10px 10px 40px 10px', // Adjusted padding for polaroid frame effect
    width: '200px', // Fixed width for polaroid
    height: '250px', // Fixed height for polaroid
    position: 'relative',
    boxSizing: 'border-box', // Ensure padding is included in width/height
    boxShadow: '0px 0px 10px rgba(0,0,0,0.3)', // Stronger, uniform polaroid shadow
    transform: `rotate(${Math.random() * 6 - 3}deg)`, // Random slight rotation
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
    transform: 'translate(-50%, -50%) rotate(-15deg)', // More pronounced tilt
    zIndex: 2,
  };

  return (
    <div // This will be the 3D container, with perspective
      className="relative"
      style={{
        ...polaroidStyle,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.6s',
        transformOrigin: 'top left', // Set transform origin to top left
        transform: isFlipped ? 'rotateY(-45deg) rotateX(10deg)' : 'none', // Rotate for lifting effect
      }}
      onClick={() => setIsFlipped(!isFlipped)} // Toggle flip on click
    >
      {/* Front of the polaroid */}
      <div
        className="absolute inset-0"
        style={{ backfaceVisibility: 'hidden' }} // No transform here, parent handles rotation
      >
        <div style={tapeStyle} className="top-0 left-0 rotate-3"></div> {/* Tape on each polaroid */}
        <div // This div will hold the image and respect the padding
        style={{
          position: 'absolute', // Position relative to its parent (absolute inset-0 div)
          top: '10px',
          left: '10px',
          width: 'calc(100% - 20px)', // 100% of parent - 10px left - 10px right
          height: 'calc(100% - 50px)', // 100% of parent - 10px top - 40px bottom
          display: 'flex', // To center the image if needed
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden', // Hide overflow if image is larger
        }}
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          className="object-contain" // Ensure image fits within its container
          style={{ maxWidth: '100%', maxHeight: '100%' }} // Constrain image to its parent div
          onClick={handleSpotifyNavigation} // Navigate to Spotify on image click
        />
      </div>
        <p
          className={`text-sm text-center px-2`}
          style={{ fontFamily: 'Playfair Display', position: 'absolute', bottom: '10px', width: 'calc(100% - 2rem)' }}
        >
          {item.title} - {item.artists?.map(a => a.name).join(', ')}
        </p>
      </div>
    </div>
  );
};

export default BucketListItemCard;
