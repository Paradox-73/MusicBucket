import React from 'react';

interface SonicSagaCardProps {
  artistName: string;
  artworkUrl: string;
  primaryGenre: string;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  rarity: string;
}

const SonicSagaCard: React.FC<SonicSagaCardProps> = ({
  artistName,
  artworkUrl,
  primaryGenre,
  level,
  hp,
  attack,
  defense,
  rarity,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 m-2 w-64 transform transition-transform duration-300 hover:scale-105">
      <img src={artworkUrl} alt={artistName} className="w-full h-48 object-cover rounded-md mb-4" />
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{artistName}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Type: {primaryGenre}</p>
      <div className="flex justify-between text-sm mb-2">
        <span>Level: {level}</span>
        <span>Rarity: {rarity}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded">
          <p className="font-semibold">HP</p>
          <p>{hp}</p>
        </div>
        <div className="bg-red-100 dark:bg-red-900 p-1 rounded">
          <p className="font-semibold">ATK</p>
          <p>{attack}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-1 rounded">
          <p className="font-semibold">DEF</p>
          <p>{defense}</p>
        </div>
      </div>
    </div>
  );
};

export default SonicSagaCard;
