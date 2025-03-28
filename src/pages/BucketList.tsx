import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '../components/Bucket_List/layout/MainLayout';
import { AuthCallback } from '../components/Bucket_List/AuthCallback';
import { useSpotifyAuth } from '../hooks/Bucket_List/useSpotifyAuth';

const BucketList = () => {
  const { isLoading } = useSpotifyAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 h-12 w-12"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/callback" element={<AuthCallback />} />
      <Route path="/" element={<MainLayout />} />
    </Routes>
  );
};

export default BucketList;