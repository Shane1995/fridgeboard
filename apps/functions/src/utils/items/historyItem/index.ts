import * as z from 'zod/mini';

// HH#<id> / HIST#<listId>#<lower-cased name>
export const HistoryItemSchema = z.looseObject({
  name: z.string(),
  shopIds: z.optional(z.array(z.string())),
  shopId: z.optional(z.string()),
  count: z.number(),
});
