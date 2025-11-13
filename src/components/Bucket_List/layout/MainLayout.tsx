import { List } from 'lucide-react';
import { LoginButton } from '../LoginButton';
import { useSpotifyAuth } from '../../../hooks/Bucket_List/useSpotifyAuth';
import { Toaster } from 'sonner';
import { Routes, Route } from 'react-router-dom';
import { BucketListsGrid } from './BucketListsGrid';
import { BucketListDetail } from './BucketListDetail';

export function MainLayout() {
  const { isAuthenticated } = useSpotifyAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-black p-4">
        <List className="h-16 w-16 text-purple-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">MusicBucket</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
          Connect with your Spotify account to create and manage your music discovery bucket list.
        </p>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-100 dark:bg-black">
      <Toaster richColors />
      <Routes>
        <Route path="/" element={<BucketListsGrid />} />
        <Route path=":listId" element={<BucketListDetail />} />
      </Routes>
    </div>
  );
}