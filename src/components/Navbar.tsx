import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SpotifyAuth } from '../lib/spotify/auth';
import { getMe, spotifyApi } from '../lib/spotify';
import type { SpotifyProfile } from '../types/spotify';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../hooks/useAuth'; // Import useAuth

const Navbar = () => {
  console.log('Navbar: Component rendering.');
  const { user, accessToken } = useAuth(); // Use accessToken from useAuth
  const [spotifyUser, setSpotifyUser] = useState<SpotifyProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log('Navbar: user state changed:', user);
    console.log('Navbar: Spotify Access Token from useAuth:', accessToken);

    if (user && accessToken) {
      console.log('Navbar: Fetching Spotify profile...');
      getMe().then(profile => {
        if (profile) {
          console.log('Navbar: Spotify profile fetched:', profile);
          setSpotifyUser(profile);
        } else {
          console.log('Navbar: Failed to fetch Spotify profile.');
          setSpotifyUser(null);
        }
      });
    } else if (!user) {
      console.log('Navbar: Supabase user logged out, clearing Spotify user.');
      setSpotifyUser(null);
    }
  }, [user, accessToken]); // React to changes in user and accessToken

  const handleLogin = () => {
    SpotifyAuth.getInstance().authenticate();
  };

  const handleLogout = () => {
    SpotifyAuth.getInstance().logout();
    setSpotifyUser(null);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">MusicBucket</Link>
        <div className="flex items-center">
          <ThemeToggle />
          {spotifyUser ? (
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center cursor-pointer ml-4"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img
                  src={spotifyUser.images?.[0]?.url}
                  alt={spotifyUser.display_name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{spotifyUser.display_name}</span>
              </div>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={handleLogin} className="ml-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Login with Spotify
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
