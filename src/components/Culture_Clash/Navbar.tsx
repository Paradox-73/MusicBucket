import React from 'react';
import { Link } from 'react-router-dom';
import { Music2, Globe, User } from 'lucide-react';
import { useAuthStore } from '../../store/Culture_Clash/authStore';

export default function Navbar() {
  const { isAuthenticated, profile } = useAuthStore();

  return (
    <nav className="bg-[#800080] text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
          <Music2 size={24} />
          <span>CultureClash</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/" className="hover:text-[#00CCCC] transition-colors flex items-center space-x-1">
            <Globe size={20} />
            <span>Explore</span>
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <img 
                src={profile?.images[0]?.url} 
                alt={profile?.display_name}
                className="w-8 h-8 rounded-full"
              />
              <span>{profile?.display_name}</span>
            </div>
          ) : (
            <button 
              onClick={() => {/* Spotify auth */}}
              className="flex items-center space-x-1 bg-[#00CCCC] hover:bg-[#00BBBB] px-4 py-2 rounded-full transition-colors"
            >
              <User size={20} />
              <span>Login with Spotify</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}