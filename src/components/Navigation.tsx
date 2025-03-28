import React from 'react';
import { Link } from 'react-router-dom';
import { Music2, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const Navigation: React.FC = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          {user ? (
            <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-secondary transition-colors duration-200">
              Profile
            </Link>
          ) : (
            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-secondary transition-colors duration-200">
              Login
            </Link>
          )}
          <ThemeToggle />
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