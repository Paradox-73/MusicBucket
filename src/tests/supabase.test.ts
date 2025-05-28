import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../lib/supabase';
import { BucketListItem } from '../types/Bucket_List/bucket';

const TEST_USER_ID = 'test-user-123';

describe('Bucket List Operations', () => {
  let testItemId: string;

  it('should create a bucket list item', async () => {
    const testItem: BucketListItem = {
      id: '',
      user_id: TEST_USER_ID,
      name: 'Test Artist',
      type: 'artist',
      completed: false,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('Bucket_List')
      .insert(testItem)
      .select();

    expect(error).toBeNull();
    testItemId = data?.[0]?.id || '';
    expect(data?.[0].user_id).toBe(TEST_USER_ID);
  });

  it('should retrieve user-specific items', async () => {
    const { data, error } = await supabase
      .from('Bucket_List')
      .select('*')
      .eq('user_id', TEST_USER_ID);

    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
    expect(data?.[0].id).toBe(testItemId);
  });

  afterAll(async () => {
    if (testItemId) {
      await supabase
        .from('Bucket_List')
        .delete()
        .eq('id', testItemId);
    }
  });
});