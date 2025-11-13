import React, { useState, useEffect } from 'react';
import TierMaker from '../components/TierMaker/TierMaker';
import { LogIn, Trophy } from 'lucide-react';
import { MainAppSpotifyAuth } from '../lib/spotifyAuth';

const TierMakerPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true);
      try {
        const spotifyAuth = MainAppSpotifyAuth.getInstance();
        const authStatus = await spotifyAuth.isAuthenticated();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    const spotifyAuth = MainAppSpotifyAuth.getInstance();
    await spotifyAuth.authenticate();
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 h-12 w-12"></div>
          <p className="text-gray-600 dark:text-gray-300">Checking Spotify authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Trophy className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create Your Music Tier Lists</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">To create and manage your personalized music tier lists, please connect with your Spotify account.</p>
          <button
            onClick={handleLogin}
            className="flex items-center space-x-2 mx-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            <LogIn className="h-5 w-5" />
            <span>Connect with Spotify</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <TierMaker />
    </div>
  );
};

export default TierMakerPage;
