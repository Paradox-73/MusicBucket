import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  onSave: (croppedImage: Blob) => void;
}

export function ImageCropModal({ isOpen, onClose, image, onSave }: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  const getCroppedImg = () => {
    const image = imgRef.current;
    if (!image || !crop.width || !crop.height) {
      return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleSave = async () => {
    const croppedImage = await getCroppedImg();
    if (croppedImage) {
      onSave(croppedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Crop Image</h2>
        <div className="crop-container">
          <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={1} locked>
            <img ref={imgRef} src={image} alt="Crop preview" style={{ transform: `scale(${zoom})` }} />
          </ReactCrop>
        </div>
        <div className="flex items-center gap-4 mt-4">
            <label htmlFor="zoom" className="text-gray-900 dark:text-white">Zoom:</label>
            <input
                id="zoom"
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
            />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
