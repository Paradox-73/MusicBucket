import { supabase } from '../../lib/supabase';
import type { BucketItem } from '../../types/Bucket_List/bucket';

const BUCKET_LIST_ITEMS_TABLE = 'bucket_list_items';
const BUCKET_LISTS_TABLE = 'bucket_lists';
const BUCKET_LIST_COVERS_BUCKET = 'bucket_list_covers'; // New bucket for covers

// --- New Functions for Managing Bucket Lists ---

export async function getBucketLists(userId: string) {
  const { data, error } = await supabase
    .from(BUCKET_LISTS_TABLE)
    .select('*, items:bucket_list_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getBucketLists error:', error);
    throw error;
  }
  return data;
}

export async function getPublicBucketList(listId: string) {
  console.log('getPublicBucketList: Attempting to fetch public list with ID:', listId);
  const { data, error } = await supabase
    .from(BUCKET_LISTS_TABLE)
    .select('*, items:bucket_list_items(*)')
    .eq('id', listId)
    .eq('is_public', true)
    .single();

    console.log('getPublicBucketList: Supabase raw data:', data);
    console.log('getPublicBucketList: Supabase error:', error);

    if (error) {
        console.error('getPublicBucketList: Supabase error:', error);
        throw error;
    }
    console.log('getPublicBucketList: Successfully fetched list:', data);
    return data;
}




export async function createBucketList(name: string, userId: string, cover_image_url?: string, description?: string) {
    const insertData: { name: string; user_id: string; cover_image_url?: string | null; description?: string | null } = {
        name,
        user_id: userId,
        cover_image_url: cover_image_url === undefined ? null : cover_image_url,
        description: description === undefined ? null : description, // Add this line
    };

    const { data, error } = await supabase
        .from(BUCKET_LISTS_TABLE)
        .insert([insertData])
        .select()
        .single();

    if (error) {
        console.error('Supabase createBucketList error:', error);
        throw error;
    }
    return data;
}

export async function updateBucketList(listId: string, updates: { name?: string; is_public?: boolean; cover_image_url?: string | null; description?: string | null }) {
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

export async function uploadBucketListCover(file: File, userId: string, listId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${listId}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_LIST_COVERS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Supabase uploadBucketListCover error:', error);
    throw error;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_LIST_COVERS_BUCKET)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
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
    notes: item.notes,
    position: item.position,
  })) || [];
}

export async function addItemToBucketList(item: Omit<BucketItem, 'id' | 'created_at'> & { user_id: string, spotify_id: string, notes?: string, position: number }, listId: string): Promise<BucketItem> {
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
        notes: item.notes,
        position: item.position,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBucketListItemCompletion(itemId: string, completed: boolean): Promise<BucketItem> {
  const { data, error } = await supabase
    .from(BUCKET_LIST_ITEMS_TABLE)
    .update({ completed: completed })
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Supabase updateBucketListItemCompletion error:', error);
    throw error;
  }

  // Map the data back to BucketItem interface
  return {
    id: data.id,
    user_id: data.user_id,
    name: data.title, // Assuming 'title' in DB maps to 'name' in interface
    imageUrl: data.imageUrl,
    artists: data.artists,
    type: data.type,
    completed: data.completed,
    created_at: data.created_at,
    spotify_id: data.spotify_id,
    notes: data.notes,
    position: data.position,
  };
}

export async function updateBucketListItemPositions(items: { id: string; position: number }[]): Promise<void> {
  const updates = items.map(item => ({
    id: item.id,
    position: item.position,
  }));

  const { error } = await supabase
    .from(BUCKET_LIST_ITEMS_TABLE)
    .upsert(updates, { onConflict: 'id' }); // Use upsert to update multiple rows

  if (error) {
    console.error('Supabase updateBucketListItemPositions error:', error);
    throw error;
  }
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
