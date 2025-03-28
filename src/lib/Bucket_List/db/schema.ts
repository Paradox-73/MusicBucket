import { z } from 'zod';

export const ItemTypeEnum = z.enum(['artist', 'album', 'track', 'playlist', 'podcast']);
export const PriorityEnum = z.enum(['low', 'medium', 'high']);

export const BucketItemSchema = z.object({
  id: z.string(),
  type: ItemTypeEnum,
  name: z.string(),
  imageUrl: z.string(),
  artists: z.array(z.string()).optional(),
  addedAt: z.string(),
  listened: z.boolean(),
  priority: PriorityEnum,
  notes: z.string().optional(),
});

export type BucketItem = z.infer<typeof BucketItemSchema>;