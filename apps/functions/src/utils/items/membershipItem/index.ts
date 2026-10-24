import * as z from 'zod/mini';

// HH#<id> / MEMBER#<sub>, read through GSI1 (GSI1PK USER#<sub>, GSI1SK HH#<id>)
export const MembershipItemSchema = z.looseObject({
  GSI1SK: z.string(),
  role: z.string(),
});
