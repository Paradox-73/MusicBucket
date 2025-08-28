import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LoginButton } from '../components/Dashboard/LoginButton';
import { Dashboard } from '../components/Dashboard/Dashboard';
import { MainAppSpotifyAuth } from '../lib/spotifyAuth';

const queryClient = new QueryClient();

const DashboardPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const location = useLocation();

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

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {isAuthenticated ? (
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
      </div>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default DashboardPage;
