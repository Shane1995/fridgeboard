import * as z from 'zod/mini';

// HH#<id> / META
export const HouseholdMetaItemSchema = z.looseObject({
  PK: z.string(),
  name: z.string(),
  rev: z.optional(z.number()),
});
