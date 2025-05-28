import { supabase } from '../../lib/supabase';
import type { BucketListItem } from '../../types/Bucket_List/bucket';

const TABLE = 'bucket_list_items';

export async function getBucketList(user_id: string): Promise<BucketListItem[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addBucketListItem(item: Omit<BucketListItem, 'id' | 'created_at'>): Promise<BucketListItem> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([item])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBucketListItem(id: string, updates: Partial<BucketListItem>): Promise<BucketListItem> {
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