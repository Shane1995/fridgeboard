import * as z from 'zod/mini';

// HH#<id> / ITEM#<listId>#<itemId>. A row with no `shopIds` is in no shop.
export const ListItemSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  shopIds: z.optional(z.array(z.string())),
  checked: z.boolean(),
  createdAt: z.number(),
  addedBy: z.string(),
});
