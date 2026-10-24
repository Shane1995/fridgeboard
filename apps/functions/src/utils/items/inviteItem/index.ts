import * as z from 'zod/mini';
import { INVITE_TYPE } from '../../keys/types.ts';

// INVITE#<email> / INVITE
export const InviteItemSchema = z.looseObject({
  type: z.enum(INVITE_TYPE),
  hhId: z.optional(z.string()),
  admin: z.optional(z.boolean()),
});
