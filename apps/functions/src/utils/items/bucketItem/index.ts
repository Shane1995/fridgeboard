import * as z from 'zod/mini';

// HH#<id> / BUCKET#<listId>#<bucketId>
export const BucketItemSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  order: z.number(),
});
