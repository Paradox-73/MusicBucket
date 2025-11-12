import React from 'react';
import { useSupabaseRealtimeStatusStore } from '../store/supabaseRealtimeStatusStore';

export const SupabaseRealtimeBanner: React.FC = () => {
  const { isSupabaseRealtimeOnline } = useSupabaseRealtimeStatusStore();

  if (isSupabaseRealtimeOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center p-2 z-50">
      You are offline. Real-time collaboration is paused.
    </div>
  );
};
