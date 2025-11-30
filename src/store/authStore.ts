import { create } from 'zustand';
import { AuthState } from '../types/auth';
import { supabase } from '../lib/supabase';
import { upsertProfile } from '../services/Auth/supabaseAuth';

export const useAuthStore = create<AuthState>((set) => {
  // Initial state
  set({
    user: null,
    session: null,
    loading: true,
  });

  console.log('AuthStore: Initializing onAuthStateChange listener.'); // Add this

  // Subscribe to auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('AuthStore: onAuthStateChange event:', event); // Debugging
    console.log('AuthStore: onAuthStateChange session:', session); // Debugging

    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      console.log('AuthStore: Handling SIGNED_IN or INITIAL_SESSION.'); // Add this
      set({
        user: session?.user || null,
        session: session || null,
        loading: false,
      });
      console.log('AuthStore: State updated - User:', session?.user, 'Session:', session);
      if (session?.user) {
        try {
          upsertProfile(session.user);
        } catch (e) {
          console.error('Failed to upsert profile:', e);
        }
      }
    } else if (event === 'SIGNED_OUT') {
      console.log('AuthStore: Handling SIGNED_OUT.'); // Add this
      set({
        user: null,
        session: null,
        loading: false,
      });
      console.log('AuthStore: State updated - User: null, Session: null'); // Add this
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('AuthStore: Handling TOKEN_REFRESHED.'); // Add this
      set({
        user: session?.user || null,
        session: session || null,
        loading: false,
      });
      console.log('AuthStore: State updated - User:', session?.user, 'Session:', session); // Add this
    } else {
      console.log('AuthStore: Handling other event:', event); // Add this
      set({ loading: false });
    }
  });

  // Return the initial state (which will be updated by the subscription)
  return {
    user: null,
    session: null,
    loading: true,
  };
});