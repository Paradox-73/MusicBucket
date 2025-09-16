import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface BucketListItem {
  id: string;
  title: string;
  imageUrl: string;
  artists: { name: string }[];
  type: 'artist' | 'album' | 'track';
  spotify_id?: string;
  notes?: string;
}

interface BucketListItemCardProps {
  item: BucketListItem;
}

const BucketListItemCard: React.FC<BucketListItemCardProps> = ({ item }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [zoom, setZoom] = useState(1);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!croppedImageUrl) {
      setIsModalOpen(true);
    }
  }, []); // Changed dependency array

  const handleSpotifyNavigation = () => {
    let spotifyUrl = '';
    if (item.type === 'artist') {
      spotifyUrl = `https://open.spotify.com/artist/${item.spotify_id}`;
    } else if (item.type === 'album') {
      spotifyUrl = `https://open.spotify.com/album/${item.spotify_id}`;
    } else if (item.type === 'track') {
      spotifyUrl = `https://open.spotify.com/track/${item.spotify_id}`;
    }
    if (spotifyUrl) {
      window.open(spotifyUrl, '_blank');
    }
  };

  const onCropComplete = (crop: Crop) => {
    if (imgRef.current && crop.width && crop.height) {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
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
        const base64Image = canvas.toDataURL('image/jpeg');
        setCroppedImageUrl(base64Image);
      }
    }
  };

  const polaroidStyle = {
    backgroundColor: 'white',
    padding: '10px 10px 40px 10px',
    width: '200px',
    height: '250px',
    position: 'relative' as const,
    boxSizing: 'border-box' as const,
    boxShadow: '0px 0px 10px rgba(0,0,0,0.3)',
    transform: `rotate(${Math.random() * 6 - 3}deg)`,
  };

  const tapeStyle = {
    backgroundImage: `url('/assets/clear tape.jpg')`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '50px',
    height: '20px',
    position: 'absolute' as const,
    top: '0',
    left: '0',
    transform: 'translate(-50%, -50%) rotate(-15deg)',
    zIndex: 2,
  };

  return (
    <>
      <div
        className="relative"
        style={{
          ...polaroidStyle,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transformOrigin: 'top left',
          transform: isFlipped ? 'rotateY(-45deg) rotateX(10deg)' : 'none',
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div style={tapeStyle} className="top-0 left-0 rotate-3"></div>
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              width: 'calc(100% - 20px)',
              height: 'calc(100% - 50px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src={croppedImageUrl || item.imageUrl}
              alt={item.title}
              className="object-contain"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
              onClick={handleSpotifyNavigation}
            />
          </div>
          <p
            className={`text-sm text-center px-2`}
            style={{ fontFamily: 'Playfair Display', position: 'absolute', bottom: '10px', width: 'calc(100% - 2rem)' }}
          >
            {item.title} - {item.artists?.map(a => a.name).join(', ')}
          </p>
          <button onClick={() => setIsModalOpen(true)} style={{ position: 'absolute', bottom: '5px', right: '5px', zIndex: 3 }}>Crop</button>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '20px' }}>
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              onComplete={onCropComplete}
              aspect={200 / 250}
            >
              <img ref={imgRef} src={item.imageUrl} style={{ transform: `scale(${zoom})` }} alt="Source" />
            </ReactCrop>
            <div>
              <label>Zoom</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>
            <button onClick={() => setIsModalOpen(false)}>Done</button>
          </div>
        </div>
      )}
    </>
  );
};

export default BucketListItemCard;