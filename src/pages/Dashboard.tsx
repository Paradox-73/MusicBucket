import React from 'react';
import { useLocation } from 'react-router-dom';
import { Dashboard } from '../components/Dashboard/Dashboard';
import { useAuthStore } from '../store/authStore';
import { SpotifyAuth } = '../lib/spotify/auth';
import { LoadingSpinner } from '../components/Dashboard/LoadingSpinner';

const DashboardPage = () => {
  const { session, loading } = useAuthStore();
  const location = useLocation();

  const handleLogin = async () => {
    const spotifyAuth = SpotifyAuth.getInstance();
    await spotifyAuth.authenticate();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 dark:text-gray-300">Loading authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {session ? (
        <Dashboard />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <button
            onClick={handleLogin}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <span>Connect with Spotify</span>
          </button>
        </div>
      )}
      <Toaster position="top-right" />
    </div>
  );
};

export default DashboardPage;
