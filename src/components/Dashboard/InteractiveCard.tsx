import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InteractiveCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({ front, back }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full h-full" onMouseEnter={handleFlip} onMouseLeave={handleFlip}>
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
          {front}
        </div>
        <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          {back}
        </div>
      </motion.div>
    </div>
  );
};