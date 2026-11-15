import * as z from 'zod/mini';
import { InviteItemSchema } from '../../utils/items/inviteItem/index.ts';
import { inviteKey } from '../../utils/keys/inviteKey/index.ts';
import type { InviteOptions } from './types.ts';

const InviteExpirySchema = z.looseObject({ expiresAt: z.optional(z.unknown()) });

export const getInvite = ({ table, email }: InviteOptions) =>
  table.get(inviteKey(email), InviteItemSchema);

export const getInviteExpiry = async ({
  table,
  email,
}: InviteOptions): Promise<number | undefined> => {
  const invite = await table.get(inviteKey(email), InviteExpirySchema);
  return typeof invite?.expiresAt === 'number' ? invite.expiresAt : undefined;
};

export const deleteInvite = async ({ table, email }: InviteOptions): Promise<void> => {
  await table.remove(inviteKey(email));
};
