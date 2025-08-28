import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { upsertProfile } from '../services/Auth/supabaseAuth';

export const useAuth = () => {
  const { user, session, loading } = useAuthStore();

  

  console.log('useAuth: Current state - User:', user, 'Session:', session, 'Loading:', loading);
  return { user, session, loading };
};