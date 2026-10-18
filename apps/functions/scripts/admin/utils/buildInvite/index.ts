import { inviteKey, type Invite, type TableKey } from '../../../../src/utils/keys/index.ts';
import { INVITE_TTL_SECONDS } from './constants.ts';
import type { BuildInviteInput } from './types.ts';

export type { BuildInviteInput } from './types.ts';

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
    type: app ? 'app' : 'household',
    ...(household ? { hhId: household } : {}),
    ...(admin ? { admin: true } : {}),
    invitedBy,
    expiresAt,
    ttl: expiresAt,
  };
};
