import * as z from 'zod/mini';

// HH#<id> / ITEM#<listId>#<itemId>. Rows written before an item could be in several shops hold
// `shopId` instead of `shopIds`; `shopIdsOf` reads either.
export const ListItemSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  shopIds: z.optional(z.array(z.string())),
  shopId: z.optional(z.string()),
  checked: z.boolean(),
  createdAt: z.number(),
  addedBy: z.string(),
});
