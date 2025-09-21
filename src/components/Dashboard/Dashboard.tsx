import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { createSpotifyApi } from '../../lib/Dashboard/spotify';
import { sleep } from '../../lib/Dashboard/spotify';
import { SpotifyAuth } from '../../lib/spotify/auth';
import { UserProfile } from './UserProfile';
import { MusicTasteAnalyzer, calculateMusicTasteMetrics } from './MusicTasteAnalyzer';
import { ErrorMessage } from './ErrorMessage';
import { TopArtistCard } from './TopArtistCard';
import { TopTrackCard } from './TopTrackCard';
import { SkeletonCard } from './SkeletonCard';
import { PopularityHighlights } from './PopularityHighlights';
import { LoadingSpinner } from './LoadingSpinner';
import { DecadeChart } from './DecadeChart';
import { PlaylistMetrics } from './PlaylistMetrics';
import { LibraryGrowthChart } from './LibraryGrowthChart';
import { ArtistNetworkGraph } from './ArtistNetworkGraph';
import { useColor } from 'color-thief-react';
import { Achievements } from './Achievements';
import { checkAndAwardAchievements } from '../../services/AchievementService';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';
type PlaylistOwnershipFilter = 'all' | 'mine' | 'others';

export const Dashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('medium_term');
  const [playlistOwnershipFilter, setPlaylistOwnershipFilter] = useState<PlaylistOwnershipFilter>('all');
  const spotifyAuth = SpotifyAuth.getInstance();
  const queryClient = useQueryClient();

  const [isRateLimited, setIsRateLimited] = useState(false);

  const { data: currentUser, isLoading: isLoadingUser, error: errorUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token, setIsRateLimited);
      const response = await spotifyApi.getCurrentUser();
      return response.data;
    },
    staleTime: Infinity, // User data doesn't change often
  });

  const { data: allTracksData, isLoading: isLoadingAllTracks, error: errorAllTracks } = useQuery({
    queryKey: ['all-tracks-analysis'],
    queryFn: () => queryClient.getQueryData(['all-tracks-analysis']),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!currentUser, // Only run this query if currentUser is available
  });

  const allTracks = allTracksData?.allTracks || [];
  const uniqueSongCount = allTracksData?.uniqueSongCount || 0;
  const playlists = allTracksData?.playlists || [];

  const filteredAllTracks = React.useMemo(() => {
    if (!currentUser) return [];
    if (playlistOwnershipFilter === 'all') return allTracks;

    const myPlaylistIds = playlists
      .filter(playlist => playlist.owner.id === currentUser.id)
      .map(playlist => playlist.id);

    const otherPlaylistIds = playlists
      .filter(playlist => playlist.owner.id !== currentUser.id)
      .map(playlist => playlist.id);

    return allTracks.filter((track: any) => {
      // Tracks from saved albums or liked songs are considered 'mine'
      if (!track.playlistId) {
        return playlistOwnershipFilter === 'mine';
      }

      // Tracks from playlists
      if (playlistOwnershipFilter === 'mine') {
        return myPlaylistIds.includes(track.playlistId);
      } else if (playlistOwnershipFilter === 'others') {
        return otherPlaylistIds.includes(track.playlistId);
      }
      return false; // Should not reach here for 'all' filter
    });
  }, [allTracks, playlists, playlistOwnershipFilter, currentUser]);

  const { data: topArtists, isLoading: isLoadingArtists, error: errorArtists } = useQuery({
    queryKey: ['topArtists', selectedTimeRange],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token, setIsRateLimited);
      const response = await spotifyApi.getTopArtists(selectedTimeRange, 50);
      return response.data.items;
    },
  });

  const musicTasteMetrics = allTracks ? calculateMusicTasteMetrics(allTracks) : null;

  useEffect(() => {
    if (currentUser && allTracks && !isLoadingAllTracks && musicTasteMetrics && topArtists) {
      checkAndAwardAchievements(currentUser.id, { allTracks, topArtists, musicTasteMetrics });
    }
  }, [currentUser, allTracks, isLoadingAllTracks, musicTasteMetrics, topArtists]);

  const topArtistImage = topArtists?.[0]?.images?.[0]?.url || '/path/to/default-artist-image.png'; // Add a default image path
  const { data: color } = useColor(topArtistImage, 'hex', { crossOrigin: 'anonymous' });

  const { data: topTracks, isLoading: isLoadingTracks, error: errorTracks } = useQuery({
    queryKey: ['topTracks', selectedTimeRange],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token, setIsRateLimited);
      const response = await spotifyApi.getTopTracks(selectedTimeRange, 50);
      return response.data.items;
    },
  });

  const error = errorArtists || errorTracks || errorAllTracks || errorUser;

  const getTopGenres = (artists: any[]) => {
    if (!artists) return [];
    const genreCounts: { [key: string]: number } = {};
    artists.forEach(artist => {
      artist.genres.forEach((genre: string) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    return Object.entries(genreCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10)
      .map(([genre]) => genre);
  };

  const topGenres = getTopGenres(topArtists);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (error) return <ErrorMessage message={error.message} />;
  if (isLoadingUser) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8" style={{ '--theme-color': color, transition: 'background-color 0.5s ease' } as React.CSSProperties}>
      {isRateLimited && (
        <div className="bg-yellow-500 text-white text-center p-2 rounded-lg mb-4">
          Spotify API rate limit reached. Retrying...
        </div>
      )}
      <UserProfile />
      {currentUser && allTracks && topArtists && musicTasteMetrics && (
        <Achievements 
          allTracks={allTracks}
          topArtists={topArtists}
          musicTasteMetrics={musicTasteMetrics}
        />
      )}
      
      <motion.div variants={containerVariants} initial="hidden" animate="visible">

        <motion.div variants={cardVariant} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-baseline mb-6">
            <h2 className="text-3xl font-bold">Your Top Charts</h2>
            <select
              className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
            >
              <option value="short_term">Last 4 Weeks</option>
              <option value="medium_term">Last 6 Months</option>
              <option value="long_term">All Time</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Top Artists</h3>
              <div className="space-y-3">
                {isLoadingArtists 
                  ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />) 
                  : topArtists?.slice(0, 5).map((artist: any, index: number) => (
                      <TopArtistCard key={artist.id} artist={artist} rank={index + 1} />
                    ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Top Tracks</h3>
              <div className="space-y-3">
                {isLoadingTracks
                  ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
                  : topTracks?.slice(0, 5).map((track: any, index: number) => (
                      <TopTrackCard key={track.id} track={track} rank={index + 1} />
                    ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardVariant} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Top Genres</h2>
          <div className="flex flex-wrap gap-2">
            {isLoadingArtists
              ? <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full animate-pulse"></div>
              : topGenres.map(genre => (
                  <span key={genre} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold capitalize">
                    {genre}
                  </span>
                ))}
          </div>
        </motion.div>

        

        <div className="flex flex-col sm:flex-row justify-between items-baseline my-8">
          <h2 className="text-3xl font-bold">Your Library</h2>
          <select
            className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={playlistOwnershipFilter}
            onChange={(e) => setPlaylistOwnershipFilter(e.target.value as TimeRange)}
          >
            <option value="all">All Playlists</option>
            <option value="mine">My Playlists</option>
            <option value="others">Other Playlists</option>
          </select>
        </div>

        <div className="mb-8">
          {isLoadingAllTracks ? <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><LoadingSpinner/></div> : <MusicTasteAnalyzer savedTracks={filteredAllTracks || []} uniqueSongCount={uniqueSongCount} />}
        </div>

        

        <motion.div variants={cardVariant} className="mb-8">
          {musicTasteMetrics && <LibraryGrowthChart data={musicTasteMetrics.monthlyAdditionsData} />}
        </motion.div>

        <motion.div variants={cardVariant} className="mb-8">
          {isLoadingAllTracks ? <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><LoadingSpinner/></div> : <DecadeChart tracks={filteredAllTracks || []} />}
        </motion.div>

        <motion.div variants={cardVariant}>
          <PlaylistMetrics playlistOwnershipFilter={playlistOwnershipFilter} uniqueSongCount={uniqueSongCount} />
        </motion.div>

        <div className="mb-8">
          { (isLoadingAllTracks || isLoadingArtists) 
            ? <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><LoadingSpinner/></div> 
            : <PopularityHighlights savedTracks={filteredAllTracks || []} topArtists={topArtists || []} />
          }
        </div>

      </motion.div>
    </div>
  );
};
