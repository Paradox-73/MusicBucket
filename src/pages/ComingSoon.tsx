import React from 'react';
import { useLocation } from 'react-router-dom';

const ComingSoon: React.FC = () => {
  const location = useLocation();
  const pageName = location.pathname.substring(1).split('-').map(
    word => word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {pageName}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          We're working hard to bring you an amazing experience. This feature will be available soon!
        </p>
        <div className="w-24 h-24 border-4 border-[#800080] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default ComingSoon;