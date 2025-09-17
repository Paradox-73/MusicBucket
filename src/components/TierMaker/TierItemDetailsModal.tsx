import React, { useRef, useEffect } from 'react'; // Import useRef, useEffect

interface TierItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
  itemType: 'artist' | 'album' | 'track' | null;
}

const TierItemDetailsModal: React.FC<TierItemDetailsModalProps> = ({
  isOpen, onClose, item, itemType
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previouslyFocusedElement.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const getSpotifyLink = () => {
    if (itemType === 'artist') {
      return `https://open.spotify.com/artist/${item.id}`;
    } else if (itemType === 'album') {
      return `https://open.spotify.com/album/${item.id}`;
    } else if (itemType === 'track') {
      return `https://open.spotify.com/track/${item.id}`;
    }
    return '#';
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      ref={modalRef}
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
          aria-label="Close" // Add aria-label
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Item Details</h2>

        <div className="flex items-center mb-4">
          <img
            src={item.images?.[0]?.url || item.album?.images?.[0]?.url || 'https://via.placeholder.com/128'}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-lg mr-4"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{item.name}</h3>
            {itemType === 'track' && item.artists && (
              <p className="text-gray-600 dark:text-gray-300">Artist: {item.artists.map((a: any) => a.name).join(', ')}</p>
            )}
            {itemType === 'album' && item.artists && (
              <p className="text-gray-600 dark:text-gray-300">Artist: {item.artists.map((a: any) => a.name).join(', ')}</p>
            )}
            {itemType === 'track' && item.album && (
              <p className="text-gray-600 dark:text-gray-300">Album: {item.album.name}</p>
            )}
            <p className="text-gray-600 dark:text-gray-300">Type: {itemType}</p>
          </div>
        </div>

        <div className="mb-4">
          {item.genres && item.genres.length > 0 && (
            <p className="text-gray-700 dark:text-gray-200">Genres: {item.genres.join(', ')}</p>
          )}
          {item.release_date && (
            <p className="text-gray-700 dark:text-gray-200">Release Date: {item.release_date}</p>
          )}
          {item.duration_ms && (
            <p className="text-gray-700 dark:text-gray-200">Duration: {(item.duration_ms / 60000).toFixed(2)} min</p>
          )}
          {item.popularity !== undefined && (
            <p className="text-gray-700 dark:text-gray-200">Popularity: {item.popularity}%</p>
          )}
        </div>

        <a
          href={getSpotifyLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          View on Spotify
        </a>
      </div>
    </div>
  );
};

export default TierItemDetailsModal;