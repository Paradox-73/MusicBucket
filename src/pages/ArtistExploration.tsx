import React, { useEffect, useState } from 'react';
import { Music } from 'lucide-react';
import { ArtistSearch } from '../components/Artist_Exploration/ArtistSearch';
import { ExplorationScore } from '../components/Artist_Exploration/ExplorationScore';
import { ArtistRankings } from '../components/Artist_Exploration/ArtistRankings';
import { SpotifyLogin } from '../components/Artist_Exploration/SpotifyLogin';
import { getAccessToken, getLikedTracks } from '../lib/Artist_Exploration/spotify';
import { SpotifyArtist, SpotifyTrack } from '../types/Artist_Exploration/spotify';
import { useAuth } from '../hooks/useAuth';
import { ArtistComparison } from '../components/Artist_Exploration/ArtistComparison';
import { ArtistRecommendations } from '../components/Artist_Exploration/ArtistRecommendations';
import { ArtistHistoricalTrends } from '../components/Artist_Exploration/ArtistHistoricalTrends';
import { grantAchievement, getUserAchievements } from '../lib/supabaseAchievements';
import { ArtistAchievements } from '../components/Artist_Exploration/ArtistAchievements';
import { useLikedSongsProgressStore } from '../store/likedSongsProgressStore';
import { analyzeArtistFrequency } from '../utils/Artist_Exploration/artistFrequency';
import { ArtistFrequencyDisplay } from '../components/Artist_Exploration/ArtistFrequencyDisplay';

const ArtistExploration = () => {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<SpotifyArtist | null>(null);
  const [selectedArtist2, setSelectedArtist2] = useState<SpotifyArtist | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [likedTracks, setLikedTracks] = useState<SpotifyTrack[] | null>(null);
  const { 
    progress: likedSongsProgress,
    isLoading: isLoadingLikedTracksStore,
    error: likedSongsError,
    startLoading,
    updateProgress,
    setError,
    reset,
  } = useLikedSongsProgressStore();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showHistoricalTrends, setShowHistoricalTrends] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [exploredArtists, setExploredArtists] = useState<Set<string>>(new Set());
  const [artistFrequencyData, setArtistFrequencyData] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = await getAccessToken();
        if (accessToken) {
          setToken(accessToken);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    console.log('ArtistExploration: fetchUserLikedTracks useEffect triggered');
    const fetchUserLikedTracks = async () => {
      if (token && user) {
        startLoading(); // Start loading in the store
        try {
          const tracks = await getLikedTracks(token, user, updateProgress); // Pass updateProgress callback
          setLikedTracks(tracks);
          reset(); // Reset store on success
        } catch (error) {
          console.error('Error fetching liked tracks:', error);
          setError(error instanceof Error ? error.message : 'Failed to load liked tracks'); // Set error in store
        } finally {
          // No longer needed to set local loading state
        }
      }
    };

    fetchUserLikedTracks();
  }, [token, user, startLoading, updateProgress, setError, reset]);

  useEffect(() => {
    if (likedTracks && likedTracks.length > 0) {
      const analysis = analyzeArtistFrequency(likedTracks);
      setArtistFrequencyData(analysis);
    }
  }, [likedTracks]);

  // Achievement logic for "First Explorer" and "Five Artists Explored"
  useEffect(() => {
    const checkArtistAchievements = async () => {
      if (user && selectedArtist) {
        const artistId = selectedArtist.id;
        if (!exploredArtists.has(artistId)) {
          setExploredArtists(prev => new Set(prev).add(artistId));

          // "First Explorer" achievement
          const userAchieved = await getUserAchievements(user.id);
          if (!userAchieved.includes('first_explorer')) {
            await grantAchievement(user.id, 'first_explorer');
          }

          // "Five Artists Explored" achievement
          if (exploredArtists.size + 1 >= 5 && !userAchieved.includes('five_artists_explored')) {
            await grantAchievement(user.id, 'five_artists_explored');
          }
        }
      }
    };
    checkArtistAchievements();
  }, [selectedArtist, user, exploredArtists]);

  const overallLoading = isLoadingAuth || isLoadingLikedTracksStore;
  console.log(`ArtistExploration: overallLoading: ${overallLoading}, isLoadingAuth: ${isLoadingAuth}, isLoadingLikedTracksStore: ${isLoadingLikedTracksStore}`);

  if (overallLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          {isLoadingAuth ? (
            <>
              <div className="mb-4 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 h-12 w-12"></div>
              <p className="text-gray-600">Checking Spotify authentication...</p>
            </>
          ) : (
            <>
              <div className="w-64 bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                <div
                  className="bg-green-600 h-4 rounded-full"
                  style={{ width: `${likedSongsProgress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-gray-600">Loading your liked tracks: {likedSongsProgress}%</p>
              {likedSongsError && <p className="text-red-500 mt-2">{likedSongsError}</p>}
            </>
          )}
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-black">
        <div className="container px-4 py-8 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Music className="w-12 h-12 text-purple-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Artist Explorer
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Discover how deep you've explored your favorite artists
              </p>
            </div>
            <SpotifyLogin />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-black">
      <div className="container px-2 sm:px-4 py-4 sm:py-8 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Music className="w-12 h-12 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Artist Explorer
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Discover how deep you've explored your favorite artists
            </p>
          </div>

          <ArtistSearch token={token} onArtistSelect={setSelectedArtist} />

          <div className="text-center text-gray-700 dark:text-gray-300">
            <p className="mb-2">Compare with another artist:</p>
            <ArtistSearch token={token} onArtistSelect={setSelectedArtist2} />
          </div>

          {selectedArtist && selectedArtist2 && likedTracks && (
            <ArtistComparison
              artist1={selectedArtist}
              artist2={selectedArtist2}
              token={token}
              likedTracks={likedTracks}
              user={user}
            />
          )}

          {selectedArtist && !selectedArtist2 && likedTracks && (
            <ExplorationScore artist={selectedArtist} token={token} likedTracks={likedTracks} user={user} />
          )}
          
          <ArtistRankings />

          {artistFrequencyData && (
            <ArtistFrequencyDisplay
              topArtists={artistFrequencyData.topArtists}
              bottomArtists={artistFrequencyData.bottomArtists}
              averageFrequency={artistFrequencyData.averageFrequency}
              totalUniqueArtists={artistFrequencyData.totalUniqueArtists}
            />
          )}

          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 mt-4"
          >
            <Music className="w-4 h-4" />
            {showRecommendations ? 'Hide' : 'Show'} Recommendations
          </button>

          {showRecommendations && token && user && (
            <ArtistRecommendations token={token} user={user} />
          )}

          <button
            onClick={() => setShowHistoricalTrends(!showHistoricalTrends)}
            className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 mt-4"
          >
            <Music className="w-4 h-4" />
            {showHistoricalTrends ? 'Hide' : 'Show'} Historical Trends
          </button>

          {selectedArtist && showHistoricalTrends && token && user && (
            <ArtistHistoricalTrends artist={selectedArtist} token={token} user={user} />
          )}

          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 mt-4 bg-green-100 dark:bg-green-800 px-4 py-2 rounded-full shadow hover:shadow-md transition-all duration-200"
          >
            <Music className="w-4 h-4" />
            {showAchievements ? 'Hide' : 'Show'} Achievements
          </button>

          {showAchievements && user && (
            <ArtistAchievements user={user} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ArtistExploration;