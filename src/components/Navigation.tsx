import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Music2, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore'; // Changed from useAuth
import { SpotifyAuth } from '../lib/spotify/auth';
import { getMe, spotifyApi } from '../lib/spotify';
import type { SpotifyProfile } from '../types/spotify';
import ThemeToggle from './ThemeToggle';
import SpotifyProfileDropdown from './SpotifyProfileDropdown'; // Import the new component

const Navigation: React.FC = () => {
  const { user } = useAuthStore(); // Changed from useAuth
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Removed spotifyUser, setSpotifyUser, showDropdown, setShowDropdown, dropdownRef as they are now handled by SpotifyProfileDropdown

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Artist Exploration', path: '/artist-exploration' },
    { name: 'Bucket List', path: '/bucket-list' },
    { name: 'Tier Maker', path: '/tiermaker' },
    
    { name: 'Rabbit Hole', path: '/rabbit-hole' },
    { name: 'Recommendation Roulette', path: '/recommendation-roulette' },
    { name: 'Roadtrip Mixtape', path: '/roadtrip-mixtape' },
    { name: 'Culture Clash', path: '/culture-clash' },
    { name: 'About Us', path: '/about' },
    { name: 'Support', path: '/support' },
  ];

  return (
    <header className="fixed w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 border-b border-primary/10 dark:border-secondary/10">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between"> {/* Adjusted padding */} 
        <Link to="/" className="flex items-center mr-4">
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
            <SpotifyProfileDropdown /> {/* Use the new component */} 
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggle />
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
              {/* SpotifyProfileDropdown as a menu item */}
              <div className="block py-2">
                <SpotifyProfileDropdown />
              </div>
            </div>
          </div>
        )}
      </header>
    );
  };
  
  export default Navigation;
