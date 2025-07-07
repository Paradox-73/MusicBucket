import { supabase } from '../../lib/supabase';
import type { BucketItem } from '../../types/Bucket_List/bucket';

const TABLE = 'bucket_list_items';

export async function getBucketList(user_id: string): Promise<BucketItem[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addBucketListItem(item: Omit<BucketItem, 'id' | 'created_at'> & { user_id: string }): Promise<BucketItem> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([
      {
        user_id: item.user_id,
        title: item.name, // Map name to title
        imageUrl: item.imageUrl,
        artists: item.artists,
        type: item.type,
        completed: item.completed,
        // created_at is handled by default value in DB
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBucketListItem(id: string, updates: Partial<Omit<BucketItem, 'user_id'>>): Promise<BucketItem> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBucketListItem(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);
  if (error) throw error;
}