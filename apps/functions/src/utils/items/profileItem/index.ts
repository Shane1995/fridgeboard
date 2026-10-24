import * as z from 'zod/mini';

// USER#<sub> / PROFILE
export const ProfileItemSchema = z.looseObject({
  email: z.string(),
  username: z.optional(z.string()),
  canCreateHousehold: z.optional(z.boolean()),
});
