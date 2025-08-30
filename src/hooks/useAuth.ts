import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { upsertProfile } from '../services/Auth/supabaseAuth';
// import { setAccessToken } from '../lib/spotify'; // Remove this import

export const useAuth = () => {
  const { user, session, loading } = useAuthStore();

  // Remove this useEffect, SpotifyAuth class will handle setting the access token
  // useEffect(() => {
  //   if (session?.access_token) {
  //     setAccessToken(session.access_token);
  //   }
  // }, [session]);

  console.log('useAuth: Current state - User:', user, 'Session:', session, 'Loading:', loading);
  return { user, session, loading, accessToken: session?.provider_token || null };
};