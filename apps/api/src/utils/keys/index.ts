import { normaliseEmail } from '../normaliseEmail/index.ts';
import { INVITE_PK_PREFIX, INVITE_SK, PROFILE_SK, USER_PK_PREFIX } from './constants.ts';
import type { TableKey } from './types.ts';

export type { Invite, TableKey } from './types.ts';

export const inviteKey = (email: string): TableKey => ({
  PK: `${INVITE_PK_PREFIX}${normaliseEmail(email)}`,
  SK: INVITE_SK,
});

export const profileKey = (sub: string): TableKey => ({
  PK: `${USER_PK_PREFIX}${sub}`,
  SK: PROFILE_SK,
});

export const membershipGsiKey = (sub: string): { GSI1PK: string } => ({
  GSI1PK: `${USER_PK_PREFIX}${sub}`,
});
