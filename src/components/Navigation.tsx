import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Music2, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore'; // Changed from useAuth
import { SpotifyAuth } from '../lib/spotify/auth';
import { getMe, spotifyApi } from '../lib/spotify';
import type { SpotifyProfile } from '../types/spotify';
import ThemeToggle from './ThemeToggle';

const Navigation: React.FC = () => {
  const { user } = useAuthStore(); // Changed from useAuth
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [spotifyUser, setSpotifyUser] = useState<SpotifyProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('handleClickOutside triggered.');
      // Check if the clicked target is the dropdown itself or the element that toggles it
      // This prevents closing when opening or clicking inside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Also check if the click was on the toggle element itself
        const toggleElement = document.getElementById('spotify-profile-toggle'); // Assign an ID to the toggle element
        if (toggleElement && toggleElement.contains(event.target as Node)) {
          console.log('Click on toggle element, not closing dropdown.');
          return; // Do nothing if click is on the toggle
        }
        console.log('Closing dropdown due to outside click.');
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Log showDropdown state changes
  useEffect(() => {
    console.log('showDropdown state:', showDropdown);
  }, [showDropdown]);

  // Fetch Spotify user profile
  useEffect(() => {
    console.log('Navigation: user state changed:', user);
    const currentSpotifyAccessToken = spotifyApi.getAccessToken();
    console.log('Navigation: Spotify Access Token directly from spotifyApi:', currentSpotifyAccessToken);

    if (user && currentSpotifyAccessToken) {
      console.log('Navigation: Fetching Spotify profile...');
      getMe().then(profile => {
        if (profile) {
          console.log('Navigation: Spotify profile fetched:', profile);
          setSpotifyUser(profile);
        } else {
          console.log('Navigation: Failed to fetch Spotify profile.');
          setSpotifyUser(null);
        }
      });
    } else if (!user) {
      console.log('Navigation: Supabase user logged out, clearing Spotify user.');
      setSpotifyUser(null);
    }
  }, [user, spotifyApi.getAccessToken()]);

  const handleLogin = () => {
    SpotifyAuth.getInstance().authenticate();
  };

  const handleLogout = () => {
    SpotifyAuth.getInstance().logout();
    setSpotifyUser(null);
  };

  const navLinks = [
    { name: 'Artist Exploration', path: '/artist-exploration' },
    { name: 'Bucket List', path: '/bucket-list' },
    { name: 'Culture Clash', path: '/culture-clash' },
    { name: 'Exploration Score', path: '/exploration-score' },
    { name: 'Rabbit Hole', path: '/rabbit-hole' },
    { name: 'Recommendation Roulette', path: '/recommendation-roulette' },
    { name: 'Roadtrip Mixtape', path: '/roadtrip-mixtape' },
    { name: 'About Us', path: '/about' },
    { name: 'Support', path: '/support' },
  ];

  return (
    <header className="fixed w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 border-b border-primary/10 dark:border-secondary/10">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Music2 className="w-8 h-8 text-primary dark:text-secondary" />
          <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-primary to-secondary dark:from-secondary dark:to-primary text-transparent bg-clip-text">
            MusicBucket
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-secondary transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
          
          {/* Spotify Profile/Login and Theme Toggle */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {spotifyUser ? (
              <div className="relative" ref={dropdownRef}>
                <div
                  id="spotify-profile-toggle"
                  className="flex items-center cursor-pointer"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <img
                    src={spotifyUser.images?.[0]?.url}
                    alt={spotifyUser.display_name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="text-gray-600 dark:text-gray-300">{spotifyUser.display_name}</span>
                </div>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        console.log('Logout button clicked!');
                        handleLogout();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleLogin} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Login with Spotify
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggle />
          {/* Spotify Profile/Login for Mobile */}
          {spotifyUser ? (
            <div className="relative" ref={dropdownRef}>
              <div
                id="spotify-profile-toggle"
                className="flex items-center cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img
                  src={spotifyUser.images?.[0]?.url}
                  alt={spotifyUser.display_name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="text-gray-600 dark:text-gray-300">{spotifyUser.display_name}</span>
              </div>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={handleLogin} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Login with Spotify
            </button>
          )}
          <button
            className="p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6 text-gray-600 dark:text-gray-300" /> : <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
          </button>
        </div>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-primary/10 dark:border-secondary/10">
            <div className="container mx-auto px-4 py-2 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-secondary transition-colors duration-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <Link
                  to="/profile"
                  className="block text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-secondary transition-colors duration-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="block text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-secondary transition-colors duration-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    );
  };
  
  export default Navigation;