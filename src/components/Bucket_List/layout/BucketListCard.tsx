import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Music, Pencil, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { updateBucketList, uploadBucketListCover } from '../../../services/Bucket_List/supabaseBucketList';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function BucketListCard({ list, onDelete, onRename, onCoverUpdate }: BucketListCardProps) {
  const [editing, setEditing] = useState(false);
  const [editedName, setEditedName] = useState(list.name);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [zoom, setZoom] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [completedCrop, setCompletedCrop] = useState<Crop>();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageToCrop(reader.result as string);
      setIsModalOpen(true);
    });
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset file input
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  const handleUploadCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    setUploading(true);
    setIsModalOpen(false);

    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error('User not logged in');
            const file = new File([blob], 'cropped-image.jpeg', { type: 'image/jpeg' });
            const newCoverUrl = await uploadBucketListCover(file, user.id, list.id);
            await updateBucketList(list.id, { cover_image_url: newCoverUrl });
            onCoverUpdate(list.id, newCoverUrl);
          } catch (error) {
            console.error('Error uploading cover image:', error);
            alert('Failed to upload cover image. Please try again.');
          } finally {
            setUploading(false);
            setImageToCrop(null);
          }
        }
      }, 'image/jpeg');
    }
  };

  const handleDeleteCover = async () => {
    try {
      if (!list.cover_image_url) {
        console.log('No cover image to delete.');
        return;
      }

      const url = new URL(list.cover_image_url);
      const path = url.pathname.substring(url.pathname.indexOf('bucket_list_covers/') + 'bucket_list_covers/'.length);

      const { error: storageError } = await supabase.storage
        .from('bucket_list_covers')
        .remove([path]);

      if (storageError) {
        console.error('Error deleting from Supabase storage:', storageError);
      }

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

      {isModalOpen && imageToCrop && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg">
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              onComplete={c => setCompletedCrop(c)}
              aspect={1}
            >
              <img ref={imgRef} src={imageToCrop} style={{ transform: `scale(${zoom})`, maxHeight: '70vh' }} alt="Source" onLoad={onImageLoad} />
            </ReactCrop>
            <div className="mt-4">
              <label className="mr-2">Zoom</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setIsModalOpen(false); setImageToCrop(null); }} className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 dark:bg-neutral-700 dark:hover:bg-neutral-600">
                Cancel
              </button>
              <button onClick={handleUploadCroppedImage} className="px-4 py-2 rounded-md text-white" style={{ backgroundColor: '#800080' }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}