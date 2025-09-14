import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Music, Pencil, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { updateBucketList, uploadBucketListCover } from '../../../services/Bucket_List/supabaseBucketList';
import { ImageCropModal } from './ImageCropModal';

interface BucketListItemForGrid {
  imageUrl?: string;
}

interface BucketList {
  id: string;
  name: string;
  created_at: string;
  items?: BucketListItemForGrid[];
  cover_image_url?: string;
  description?: string;
}

interface BucketListCardProps {
  list: BucketList;
  onDelete: (listId: string, listName: string) => void;
  onRename: (listId: string, newName: string) => void;
  onCoverUpdate: (listId: string, newCoverUrl: string | null) => void;
}

export function BucketListCard({ list, onDelete, onRename, onCoverUpdate }: BucketListCardProps) {
  const [editing, setEditing] = useState(false);
  const [editedName, setEditedName] = useState(list.name);
  const [uploading, setUploading] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCrop = async (croppedImage: Blob) => {
    setUploading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not logged in');

      const newCoverUrl = await uploadBucketListCover(new File([croppedImage], 'cover.jpg', { type: 'image/jpeg' }), user.id, list.id);
      await updateBucketList(list.id, { cover_image_url: newCoverUrl });
      onCoverUpdate(list.id, newCoverUrl);
    } catch (error) {
      console.error('Error uploading cover image:', error);
      alert('Failed to upload cover image. Please try again.');
    } finally {
      setUploading(false);
      setIsCropModalOpen(false);
    }
  };

  const handleDeleteCover = async () => {
    try {
      await updateBucketList(list.id, { cover_image_url: null });
      onCoverUpdate(list.id, null);
    } catch (error) {
      console.error('Error deleting cover image:', error);
      alert('Failed to delete cover image. Please try again.');
    }
  };

  const handleSaveRename = () => {
    if (editedName.trim() && editedName !== list.name) {
      onRename(list.id, editedName);
    }
    setEditing(false);
  };

  return (
    <>
      <div className="bg-gray-200 dark:bg-neutral-900 hover:bg-gray-300 dark:hover:bg-neutral-800 transition-colors rounded-lg p-4 flex flex-col gap-4 group relative">
        <Link to={list.id} className="flex flex-col gap-4 flex-grow">
          <div className="relative w-full aspect-square bg-gray-300 dark:bg-neutral-800 rounded-md flex items-center justify-center group-hover:shadow-lg transition-shadow overflow-hidden">
            {list.cover_image_url ? (
              <img src={list.cover_image_url} alt={list.name} className="w-full h-full object-cover" />
            ) : list.items && list.items.length > 0 ? (
              list.items.length < 4 ? (
                <img src={list.items[0].imageUrl} alt={list.name} className="w-full h-full object-cover" />
              ) : (
                <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                  {list.items.slice(0, 4).map((item, idx) => (
                    <img key={idx} src={item.imageUrl} alt={list.name} className="w-full h-full object-cover" />
                  ))}
                </div>
              )
            ) : (
              <Music size={48} className="text-gray-500 dark:text-neutral-500" />
            )}
          </div>
          <div>
            {editing ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename();
                    if (e.key === 'Escape') setEditing(false);
                  }}
                  className="w-full p-2 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveRename} className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-lg text-sm">
                    Save
                  </button>
                  <button onClick={() => setEditing(false)} className="flex-grow bg-gray-400 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="font-bold truncate">{list.name}</p>
            )}
            <p className="text-sm text-gray-500 dark:text-neutral-400">By You</p>
          </div>
        </Link>
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
            title="Change Cover Image"
            disabled={uploading}
          >
            {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Upload size={16} />}
          </button>
          {list.cover_image_url && (
            <button
              onClick={handleDeleteCover}
              className="p-1 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
              title="Delete Cover Image"
            >
              <X size={16} />
            </button>
          )}
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              title="Rename Bucket List"
            >
              <Pencil size={16} />
            </button>
          )}
          <button
            onClick={() => onDelete(list.id, list.name)}
            className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            title="Delete Bucket List"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {isCropModalOpen && selectedImage && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          image={selectedImage}
          onSave={handleSaveCrop}
        />
      )}
    </>
  );
}
