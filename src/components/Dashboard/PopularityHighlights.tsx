import React from 'react';
import { motion } from 'framer-motion';

// Define types based on expected data structure from Spotify API
interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  popularity: number;
  external_urls: { spotify: string };
  album: { images?: { url: string }[] };
}

interface SavedTrack {
  track: Track;
}

interface Artist {
    id: string;
    name: string;
    popularity: number;
    external_urls: { spotify: string };
    images?: { url: string }[];
}

interface HighlightItemProps {
  item: Track | Artist;
  isTrack: boolean;
}

const HighlightItem: React.FC<HighlightItemProps> = ({ item, isTrack }) => (
  <a
    href={item.external_urls.spotify}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex items-center space-x-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-200 dark:border-gray-700"
  >
    <img 
      src={isTrack ? (item as Track).album.images?.[0]?.url : (item as Artist).images?.[0]?.url || 'https://via.placeholder.com/48'}
      alt={item.name}
      className="w-12 h-12 rounded-md object-cover flex-shrink-0"
    />
    <div className="overflow-hidden flex-grow">
      <div className="font-bold truncate">{item.name}</div>
      {isTrack && <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{(item as Track).artists.map(a => a.name).join(', ')}</div>}
    </div>
    <div className="text-sm font-semibold text-purple-600 dark:text-cyan-400 pl-3">{item.popularity}</div>
  </a>
);

interface PopularityHighlightsProps {
  savedTracks: SavedTrack[];
  topArtists: Artist[];
}

export const PopularityHighlights: React.FC<PopularityHighlightsProps> = ({ savedTracks, topArtists }) => {
  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (!savedTracks || savedTracks.length === 0 || !topArtists || topArtists.length === 0) {
    return null; // Or a loading/empty state
  }

  // Calculate popular and niche tracks
  const allTracks = savedTracks.map(st => st.track);
  const sortedByPopularity = [...allTracks].sort((a, b) => b.popularity - a.popularity);
  const mostPopularTracks = sortedByPopularity.slice(0, 5);
  const mostNicheTracks = sortedByPopularity.slice(-5).reverse();

  // Calculate popular and niche artists
  const sortedArtists = [...topArtists].sort((a, b) => b.popularity - a.popularity);
  const mostPopularArtists = sortedArtists.slice(0, 5);
  const mostNicheArtists = sortedArtists.slice(-5).reverse();

  return (
    <motion.div variants={cardVariant} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Popularity Highlights</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10">
        
        <div>
          <h3 className="text-lg font-semibold mb-4 text-center">Most Mainstream Artists</h3>
          <div className="space-y-3">
            {mostPopularArtists.map(artist => <HighlightItem key={`pop-artist-${artist.id}`} item={artist} isTrack={false} />)}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-center">Most Mainstream Tracks</h3>
          <div className="space-y-3">
            {mostPopularTracks.map(track => <HighlightItem key={`pop-track-${track.id}`} item={track} isTrack={true} />)}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-center">Most Niche Artists</h3>
          <div className="space-y-3">
            {mostNicheArtists.map(artist => <HighlightItem key={`niche-artist-${artist.id}`} item={artist} isTrack={false} />)}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-center">Most Niche Tracks</h3>
          <div className="space-y-3">
            {mostNicheTracks.map(track => <HighlightItem key={`niche-track-${track.id}`} item={track} isTrack={true} />)}
          </div>
        </div>

      </div>
    </motion.div>
  );
};