import { z } from 'zod';

export const ItemTypeEnum = z.enum(['artist', 'album', 'track', 'playlist', 'podcast']);

export const BucketItemSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  artists: z.array(z.string()).optional(),
  type: ItemTypeEnum,
  completed: z.boolean(),
  created_at: z.string(),
});

export type BucketItem = z.infer<typeof BucketItemSchema>;