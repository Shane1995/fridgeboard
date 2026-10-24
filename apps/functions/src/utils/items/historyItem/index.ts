import * as z from 'zod/mini';

// HH#<id> / HIST#<listId>#<lower-cased name>
export const HistoryItemSchema = z.looseObject({
  name: z.string(),
  shopId: z.string(),
  count: z.number(),
});
