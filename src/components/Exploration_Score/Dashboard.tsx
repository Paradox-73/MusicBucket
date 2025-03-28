import React from 'react';
import { UserProfile } from './UserProfile';
import { MusicTasteAnalyzer } from './MusicTasteAnalyzer';

export const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfile />
      <MusicTasteAnalyzer />
    </div>
  );
};