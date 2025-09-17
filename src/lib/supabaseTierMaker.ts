import { supabase } from './supabase';

export const saveTierList = async (userId: string, title: string, description: string, scope: string, scopeContext: string | null, tiers: any) => {
  try {
    // 1. Create the tier_list record
    const { data: listData, error: listError } = await supabase
      .from('tier_lists')
      .insert({
        user_id: userId,
        title,
        description,
        scope,
        scope_context: scopeContext,
      })
      .select()
      .single();

    if (listError) throw listError;

    const tierListId = listData.id;

    // 2. Create the tier records and placement records
    for (const tier of tiers) {
      const { data: tierData, error: tierError } = await supabase
        .from('tiers')
        .insert({
          tier_list_id: tierListId,
          label: tier.label,
          color: tier.color,
          rank: tier.rank,
        })
        .select()
        .single();

      if (tierError) throw tierError;

      const tierId = tierData.id;

      if (tier.items.length > 0) {
        const placements = tier.items.map((item, index) => ({
          tier_id: tierId,
          item_spotify_id: item.id,
          rank_in_tier: index,
        }));

        const { error: placementError } = await supabase
          .from('tier_list_placements')
          .insert(placements);

        if (placementError) throw placementError;
      }
    }

    return { success: true, data: listData };
  } catch (error) {
    console.error('Error saving tier list:', error);
    return { success: false, error };
  }
};

export const updateTierList = async (tierListId: string, title: string, description: string, scope: string, scopeContext: string | null, tiers: any) => {
  try {
    // 1. Update the tier_list record
    const { data: listData, error: listError } = await supabase
      .from('tier_lists')
      .update({
        title,
        description,
        scope,
        scope_context: scopeContext,
      })
      .eq('id', tierListId)
      .select()
      .single();

    if (listError) throw listError;

    // 2. Delete existing tiers and placements for this tier list
    const { error: deleteTiersError } = await supabase
      .from('tiers')
      .delete()
      .eq('tier_list_id', tierListId);

    if (deleteTiersError) throw deleteTiersError;

    // 3. Recreate the tier records and placement records
    for (const tier of tiers) {
      const { data: tierData, error: tierError } = await supabase
        .from('tiers')
        .insert({
          tier_list_id: tierListId,
          label: tier.label,
          color: tier.color,
          rank: tier.rank,
        })
        .select()
        .single();

      if (tierError) throw tierError;

      const tierId = tierData.id;

      if (tier.items.length > 0) {
        const placements = tier.items.map((item, index) => ({
          tier_id: tierId,
          item_spotify_id: item.id,
          rank_in_tier: index,
        }));

        const { error: placementError } = await supabase
          .from('tier_list_placements')
          .insert(placements);

        if (placementError) throw placementError;
      }
    }

    return { success: true, data: listData };
  } catch (error) {
    console.error('Error updating tier list:', error);
    return { success: false, error };
  }
};

export const getTierList = async (listId: string) => {
  try {
    const { data: listData, error: listError } = await supabase
      .from('tier_lists')
      .select('*, tiers(*, tier_list_placements(*))')
      .eq('id', listId)
      .single();

    if (listError) throw listError;

    return { success: true, data: listData };
  } catch (error) {
    console.error('Error getting tier list:', error);
    return { success: false, error };
  }
};

export const getPublicTierList = async (listId: string) => {
  try {
    const { data: listData, error: listError } = await supabase
      .from('tier_lists')
      .select('*, tiers(*, tier_list_placements(*))')
      .eq('id', listId)
      .eq('is_public', true)
      .single();

    if (listError) throw listError;

    return { success: true, data: listData };
  } catch (error) {
    console.error('Error getting public tier list:', error);
    return { success: false, error };
  }
};

export const publishTierList = async (listId: string) => {
  try {
    const { data, error } = await supabase
      .from('tier_lists')
      .update({ is_public: true })
      .eq('id', listId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error publishing tier list:', error);
    return { success: false, error };
  }
};

export const getMyTierLists = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('tier_lists')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting user tier lists:', error);
    return null;
  }
};