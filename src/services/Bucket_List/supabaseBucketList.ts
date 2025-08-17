import { supabase } from '../../lib/supabase';
import type { BucketItem } from '../../types/Bucket_List/bucket';

const BUCKET_LIST_ITEMS_TABLE = 'bucket_list_items';
const BUCKET_LISTS_TABLE = 'bucket_lists';

// --- New Functions for Managing Bucket Lists ---

export async function getBucketLists(userId: string) {
  const { data, error } = await supabase
    .from(BUCKET_LISTS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getBucketLists error:', error);
    throw error;
  }
  return data;
}

export async function getPublicBucketList(listId: string) {
  const { data, error } = await supabase
    .from(BUCKET_LISTS_TABLE)
    .select('*, items:bucket_list_items(*)')
    .eq('id', listId)
    .eq('is_public', true)
    .single();

    if (error) {
        console.error('Supabase getPublicBucketList error:', error);
        throw error;
    }
    return data;
}

export async function createBucketList(name: string, userId: string) {
    const { data, error } = await supabase
        .from(BUCKET_LISTS_TABLE)
        .insert([{ name, user_id: userId }])
        .select()
        .single();

    if (error) {
        console.error('Supabase createBucketList error:', error);
        throw error;
    }
    return data;
}

export async function updateBucketList(listId: string, updates: { name?: string; is_public?: boolean }) {
    const { data, error } = await supabase
        .from(BUCKET_LISTS_TABLE)
        .update(updates)
        .eq('id', listId)
        .select()
        .single();

    if (error) {
        console.error('Supabase updateBucketList error:', error);
        throw error;
    }
    return data;
}

export async function deleteBucketList(listId: string) {
    const { error } = await supabase.from(BUCKET_LISTS_TABLE).delete().eq('id', listId);
    if (error) {
        console.error('Supabase deleteBucketList error:', error);
        throw error;
    }
}


// --- Functions for Managing Items within a specific Bucket List ---

export async function getBucketListItems(listId: string): Promise<BucketItem[]> {
  const { data, error } = await supabase
    .from(BUCKET_LIST_ITEMS_TABLE)
    .select('*')
    .eq('bucket_list_id', listId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getBucketListItems error:', error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    user_id: item.user_id,
    name: item.title,
    imageUrl: item.imageUrl,
    artists: item.artists,
    type: item.type,
    completed: item.completed,
    created_at: item.created_at,
    spotify_id: item.spotify_id,
  })) || [];
}

export async function addItemToBucketList(item: Omit<BucketItem, 'id' | 'created_at'> & { user_id: string, spotify_id: string }, listId: string): Promise<BucketItem> {
  const { data, error } = await supabase
    .from(BUCKET_LIST_ITEMS_TABLE)
    .insert([
      {
        user_id: item.user_id,
        title: item.name,
        imageUrl: item.imageUrl,
        artists: item.artists,
        type: item.type,
        completed: item.completed,
        spotify_id: item.spotify_id,
        bucket_list_id: listId,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Existing Functions (to be deprecated) ---

const DEPRECATED_TABLE = 'bucket_list_items';

export async function getBucketList(user_id: string): Promise<BucketItem[]> {
  const { data, error } = await supabase
    .from(DEPRECATED_TABLE)
    .select('*') // Try selecting all columns again
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getBucketList error:', error);
    throw error;
  }
  const mappedData = data.map(item => ({
    id: item.id,
    user_id: item.user_id,
    name: item.title,
    imageUrl: item.imageUrl,
    artists: item.artists,
    type: item.type,
    completed: item.completed,
    created_at: item.created_at,
    spotify_id: item.spotify_id,
  })) || [];
  return mappedData;
}

export async function addBucketListItem(item: Omit<BucketItem, 'id' | 'created_at'> & { user_id: string, spotify_id: string }): Promise<BucketItem> {
  const { data, error } = await supabase
    .from(DEPRECATED_TABLE)
    .insert([
      {
        user_id: item.user_id,
        title: item.name, // Map name to title
        imageUrl: item.imageUrl,
        artists: item.artists,
        type: item.type,
        completed: item.completed,
        spotify_id: item.spotify_id, // Add this line
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBucketListItem(id: string, updates: Partial<Omit<BucketItem, 'user_id'>>): Promise<BucketItem> {
  const { data, error } = await supabase
    .from(DEPRECATED_TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBucketListItem(id: string): Promise<void> {
  const { error } = await supabase
    .from(DEPRECATED_TABLE)
    .delete()
    .eq('id', id);
  if (error) throw error;
}