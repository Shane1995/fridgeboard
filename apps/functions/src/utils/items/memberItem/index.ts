import * as z from 'zod/mini';

// HH#<id> / MEMBER#<sub>
export const MemberItemSchema = z.looseObject({
  SK: z.string(),
  role: z.string(),
});
