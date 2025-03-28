import React from 'react';
import { Disc } from 'lucide-react';

interface SpinButtonProps {
  isSpinning: boolean;
  onSpin: () => void;
}

export function SpinButton({ isSpinning, onSpin }: SpinButtonProps) {
  return (
    <button
      onClick={onSpin}
      disabled={isSpinning}
      className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 bg-[#800080] text-white rounded-lg transition-all ${
        isSpinning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#900090]'
      }`}
    >
      <Disc className={isSpinning ? 'animate-spin' : ''} />
      {isSpinning ? 'Spinning...' : 'Spin the Globe'}
    </button>
  );
}