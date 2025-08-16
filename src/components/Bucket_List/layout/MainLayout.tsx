import { Music } from 'lucide-react';
import { LoginButton } from '../LoginButton';
import { useSpotifyAuth } from '../../../hooks/Bucket_List/useSpotifyAuth';
import { SearchPanel } from './SearchPanel';
import { BucketListPanel } from './BucketListPanel';
import { Toaster } from 'sonner';

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
    <div className="flex h-full flex-col bg-black">
      <Toaster richColors />
      <main className="grid flex-1 grid-cols-12 overflow-hidden">
        {/* Left Panel: Search */}
        <div className="col-span-5 border-r border-white/10 xl:col-span-4">
          <SearchPanel />
        </div>

        {/* Right Panel: Bucket List */}
        <div className="col-span-7 xl:col-span-8">
          <BucketListPanel />
        </div>
      </main>
    </div>
  );
}