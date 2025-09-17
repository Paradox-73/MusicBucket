import React from 'react';
import TierRow from './TierRow';
import TierItem from './TierItem';

interface TierListImageProps {
  title: string;
  tiers: any[];
  scope: string;
  user: any;
  showOverlayText: boolean; // New prop
}

const TierListImage: React.FC<TierListImageProps> = ({ title, tiers, scope, user, showOverlayText }) => {
  return (
    <div className="bg-gray-800 p-8 text-white">
      <h1 className="text-4xl font-bold mb-4 text-center">{title}</h1>
      <div className="mb-4">
        {tiers.map(tier => (
          <div key={tier.id} className="flex items-stretch mb-1">
            <div
              style={{ backgroundColor: tier.color }}
              className="w-32 text-lg font-bold text-gray-800 p-4 text-center flex items-center justify-center rounded-l-md"
            >
              <span>{tier.label}</span>
            </div>
            <div className="flex flex-wrap gap-1 p-2 bg-gray-700 rounded-r-md flex-grow">
              {tier.items.map(item => {
                const currentItemType = item.itemType || scope;
                let imageUrl = '';
                let itemName = item.name;

                if (item.images && item.images.length > 0) { // For artist and album
                    imageUrl = item.images[0].url;
                } else if (item.album && item.album.images && item.album.images.length > 0) { // For track
                    imageUrl = item.album.images[0].url;
                }

                return (
                  <div key={item.id} className="w-20 h-20 relative overflow-hidden rounded">
                    {imageUrl && <img src={imageUrl} alt={itemName} className="w-full h-full object-cover" />}
                    {showOverlayText && (
                      <div
                        className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center p-1"
                      >
                        <span className="text-white text-center text-sm">{itemName}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-gray-400 mt-4">Created by: {user?.email}</p>
    </div>
  );
};

export default TierListImage;
