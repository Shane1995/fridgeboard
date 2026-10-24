import * as z from 'zod/mini';
import { InviteType } from '../../keys/types.ts';

// INVITE#<email> / INVITE
export const InviteItemSchema = z.looseObject({
  type: z.enum(InviteType),
  hhId: z.optional(z.string()),
  admin: z.optional(z.boolean()),
});
