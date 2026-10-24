import { inviteKey } from '../../../../src/utils/keys/inviteKey/index.ts';
import { INVITE_TYPE, type Invite, type TableKey } from '../../../../src/utils/keys/types.ts';
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
    type: app ? INVITE_TYPE.APP : INVITE_TYPE.HOUSEHOLD,
    ...(household ? { hhId: household } : {}),
    ...(admin ? { admin: true } : {}),
    invitedBy,
    expiresAt,
    ttl: expiresAt,
  };
};
