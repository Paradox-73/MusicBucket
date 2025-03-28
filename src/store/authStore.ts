import { create } from 'zustand';
import { AuthState } from '../types/auth';
import { supabase } from '../lib/supabase';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
}));