import React, { useEffect, useState } from 'react';
import { LogIn } from 'lucide-react';
import { MainAppSpotifyAuth } from '../../lib/spotifyAuth';

interface SpotifyConnectGateProps {
  /** Feature name shown on the connect screen, e.g. "Daily Mix". */
  title: string;
  /** Short explanation of why Spotify access is needed. */
  description: string;
  /** Large icon shown above the title on both loading and connect screens. */
  icon: React.ReactNode;
  /** Rendered only once the user is connected to Spotify. */
  children: React.ReactNode;
}

/**
 * Brand-consistent authentication gate shared by the Spotify-powered feature
 * pages. Mirrors the auth flow used across the app (Road Trip Mixtape, etc.)
 * but centralises the loading + "connect" states so every page looks the same.
 */
const SpotifyConnectGate: React.FC<SpotifyConnectGateProps> = ({
  title,
  description,
  icon,
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      setCheckingAuth(true);
      try {
        const spotifyAuth = MainAppSpotifyAuth.getInstance();
        await spotifyAuth.initialize();
        const authStatus = await spotifyAuth.isAuthenticated();
        if (!cancelled) setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Error checking Spotify auth status:', error);
        if (!cancelled) setIsAuthenticated(false);
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    };
    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async () => {
    const spotifyAuth = MainAppSpotifyAuth.getInstance();
    await spotifyAuth.authenticate();
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary dark:border-secondary/20 dark:border-t-secondary" />
          <p className="text-gray-600 dark:text-gray-300">Checking your Spotify connection…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-primary/10 bg-white p-8 text-center shadow-lg dark:border-secondary/10 dark:bg-gray-800">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white">
            {icon}
          </div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="mb-8 text-gray-600 dark:text-gray-300">{description}</p>
          <button
            onClick={handleLogin}
            className="mx-auto flex items-center justify-center space-x-2 rounded-full bg-[#1DB954] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#1ed760]"
          >
            <LogIn className="h-5 w-5" />
            <span>Connect with Spotify</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SpotifyConnectGate;
