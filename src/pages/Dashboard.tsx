import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Dashboard } from '../components/Dashboard/Dashboard';
import { LoadingSpinner } from '../components/Dashboard/LoadingSpinner';
import { Toaster } from 'react-hot-toast';
import { LogIn, LayoutDashboard } from 'lucide-react';
import { MainAppSpotifyAuth } from '../lib/spotifyAuth'; // Import MainAppSpotifyAuth

const DashboardPage = () => {
  const location = useLocation();
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
        console.error('Error checking Spotify auth status for Dashboard:', error);
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
          <LoadingSpinner />
          <p className="text-gray-600 dark:text-gray-300">Checking Spotify authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <div className="flex flex-col min-h-screen items-center justify-center p-4">
          <div className="text-center max-w-md">
            <LayoutDashboard className="w-16 h-16 text-blue-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Your Music Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">To view your personalized music insights and listening habits, please connect with your Spotify account.</p>
            <button
              onClick={handleLogin}
              className="flex items-center space-x-2 mx-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              <LogIn className="h-5 w-5" />
              <span>Connect with Spotify</span>
            </button>
          </div>
        </div>
      )}
      <Toaster position="top-right" />
    </div>
  );
};

export default DashboardPage;
