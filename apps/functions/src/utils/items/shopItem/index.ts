import * as z from 'zod/mini';

// HH#<id> / SHOP#<listId>#<shopId>
export const ShopItemSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  order: z.number(),
});
