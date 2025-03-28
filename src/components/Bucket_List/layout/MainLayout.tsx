import React from 'react';
import { Music } from 'lucide-react';
import { LoginButton } from '../LoginButton';
import { useSpotifyAuth } from '../../../hooks/Bucket_List/useSpotifyAuth';
import { SearchPanel } from './SearchPanel';
import { BucketListPanel } from './BucketListPanel';

export function MainLayout() {
  const { isAuthenticated } = useSpotifyAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
        <Music className="h-16 w-16 text-purple-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-4">MusicBucket</h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          Connect with your Spotify account to create and manage your music discovery bucket list.
        </p>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-black">
      <header className="border-b border-white/10 bg-black/95 px-6 py-4">
        <div className="flex items-center space-x-3">
          <Music className="h-8 w-8 text-purple-500" />
          <h1 className="text-xl font-bold text-white">MusicBucket</h1>
        </div>
      </header>
      
      <main className="flex flex-1 overflow-hidden">
        <div className="w-[60%] border-r border-white/10">
          <BucketListPanel />
        </div>
        <div className="w-[40%]">
          <SearchPanel />
        </div>
      </main>
    </div>
  );
}