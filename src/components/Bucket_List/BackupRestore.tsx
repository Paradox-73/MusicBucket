import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { useSpotifyStore } from '../../store/Bucket_List/spotify';

export function BackupRestore() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { backup, restore } = useSpotifyStore();

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      restore(file);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => backup()}
        className="flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
      >
        <Download className="h-4 w-4" />
        <span>Backup</span>
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
      >
        <Upload className="h-4 w-4" />
        <span>Restore</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleRestore}
        className="hidden"
      />
    </div>
  );
}