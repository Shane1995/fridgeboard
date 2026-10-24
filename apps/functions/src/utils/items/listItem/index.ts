import * as z from 'zod/mini';

// HH#<id> / ITEM#<listId>#<itemId>
export const ListItemSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  bucketId: z.string(),
  checked: z.boolean(),
  createdAt: z.number(),
  addedBy: z.string(),
});
