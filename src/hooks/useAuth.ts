import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { upsertProfile } from '../services/Auth/supabaseAuth';

export const useAuth = () => {
  const { user, session, loading } = useAuthStore();

  useEffect(() => {
    console.log('useAuth: Initializing auth state change listener.');
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state changed - Event:', event, 'Session:', session);
        useAuthStore.setState({ session, loading: false });
        if (session?.user) {
          useAuthStore.setState({ user: session.user });
          // Upsert the user's profile in the database
          try {
            await upsertProfile(session.user);
          } catch (e) {
            console.error('Failed to upsert profile:', e);
          }
        }
      }
    );

    return () => {
      console.log('useAuth: Unsubscribing from auth state changes.');
      subscription.unsubscribe();
    };
  }, []);

  console.log('useAuth: Current state - User:', user, 'Session:', session, 'Loading:', loading);
  return { user, session, loading };
};