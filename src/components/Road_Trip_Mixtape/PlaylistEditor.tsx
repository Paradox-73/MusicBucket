import React, { useState } from 'react';
import { Music, Lock, Globe, Image, Save} from 'lucide-react';
import { Track } from '../../types/Road_Trip_Mixtape';
import { useAppStore } from '../../store/Road_Trip_Mixtape';
import { getSpotifyApi } from '../../services/Road_Trip_Mixtape/auth';

interface PlaylistEditorProps {
  tracks: Track[];
  onSave: (playlist: { name: string; description: string; isPublic: boolean; image: FormData }) => void;
}

export const PlaylistEditor: React.FC<PlaylistEditorProps> = ({ tracks, onSave }) => {
  const [name, setName] = useState('My Road Trip Playlist');
  const [isPublic, setIsPublic] = useState(true);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTrack, setDraggedTrack] = useState<Track | null>(null);

  const handleDragStart = (track: Track) => {
    setDraggedTrack(track);
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedTrack) return;
    
    // Reorder logic here
    const newTracks = [...tracks];
    const oldIndex = tracks.findIndex(t => t.id === draggedTrack.id);
    newTracks.splice(oldIndex, 1);
    newTracks.splice(index, 0, draggedTrack);
    // Update store with new order
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 256KB)
    if (file.size > 256 * 1024) {
      alert('Image size must be less than 256KB');
      return;
    }

    // Create an HTMLImageElement to check dimensions
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => {
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(null);
      };
    });

    setImage(file);
  };

  const handleSave = async () => {
    const formData = new FormData();
    if (image) {
      formData.append('image', image);
    }

    onSave({
      name,
      description,
      isPublic,
      image: formData
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="w-24 h-24 sm:w-32 sm:h-32 relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {image ? (
            <img
              src={URL.createObjectURL(image)}
              alt="Playlist cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <Image className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 text-xl font-bold border-none focus:ring-2 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Playlist Name"
          />
        </div>
        <button
          onClick={() => setIsPublic(!isPublic)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 p-3 sm:p-4 border rounded-lg resize-none h-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          placeholder="Add an optional description"
        />
      </div>

      <div className="flex justify-center sm:justify-end space-x-2 sm:space-x-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save to Spotify</span>
        </button>
      </div>
    </div>
  );
}; 