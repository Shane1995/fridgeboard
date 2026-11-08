import * as z from 'zod/mini';

// USER#<sub> / PROFILE, only what is safe to show other members
export const ProfileNameItemSchema = z.looseObject({
  PK: z.string(),
  username: z.optional(z.string()),
});
