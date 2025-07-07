import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

export async function upsertProfile(user: User) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      spotify_id: user.user_metadata.provider_id,
      spotify_access_token: user.user_metadata.access_token,
      spotify_refresh_token: user.user_metadata.refresh_token,
      // Add other fields as necessary from user.user_metadata
    }, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Error upserting profile:', error);
    throw error;
  }
  return data;
}
