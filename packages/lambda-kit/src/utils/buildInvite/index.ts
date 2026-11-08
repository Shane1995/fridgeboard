import { inviteKey } from '../keys/inviteKey/index.ts';
import { InviteType, type Invite, type TableKey } from '../keys/types.ts';
import { INVITE_TTL_SECONDS } from './constants.ts';
import type { BuildInviteInput } from './types.ts';

export const buildInvite = ({
  email,
  app,
  admin,
  household,
  invitedBy,
  now,
}: BuildInviteInput): Invite & TableKey => {
  const expiresAt = now + INVITE_TTL_SECONDS;
  return {
    ...inviteKey(email),
    type: app ? InviteType.App : InviteType.Household,
    ...(household ? { hhId: household } : {}),
    ...(admin ? { admin: true } : {}),
    invitedBy,
    expiresAt,
    ttl: expiresAt,
  };
};
