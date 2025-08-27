import { Button } from "../ui/button";
import { SpotifyAuthButton } from "../spotify/SpotifyAuthButton";
import { Music2Icon, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import React, { useState } from 'react';

const navLinks = [
  { name: "Home", path: "/" },
  { name: "BucketList", path: "/bucket-list" },
  { name: "RecommendationRoulette", path: "/recommendation-roulette" },
  { name: "ArtistDepth", path: "/artist-depth" },
  { name: "MusicPersonality", path: "/music-personality" },
  { name: "Culture Clash", path: "/culture-clash" },
  { name: "About", path: "/about" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white/95 dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">
      <div className="container flex h-14 items-center px-2 sm:px-4"> {/* Adjusted padding */}
        <Link to="/" className="flex items-center space-x-2 mr-6">
          <Music2Icon className="h-6 w-6 text-blue-500 dark:text-[#00cccc]" />
          <span className="font-bold text-blue-500 dark:text-[#00cccc]">MusicBucket</span>
        </Link>
        <div className="flex-1 hidden md:flex items-center justify-between"> {/* Hidden on small screens */}
          <div className="flex gap-6 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="transition-colors hover:text-blue-500 dark:hover:text-[#00cccc]"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <SpotifyAuthButton />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <SpotifyAuthButton />
          <button
            className="ml-4 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6 text-gray-600 dark:text-gray-300" /> : <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60 border-t border-gray-200 dark:border-gray-700">
          <div className="container px-4 py-2 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 transition-colors hover:text-blue-500 dark:hover:text-[#00cccc]"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}