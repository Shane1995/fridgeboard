import { normaliseEmail } from '../normaliseEmail/index.ts';
import {
  HOUSEHOLD_META_SK,
  HOUSEHOLD_PK_PREFIX,
  INVITE_PK_PREFIX,
  INVITE_SK,
  PROFILE_SK,
  USER_PK_PREFIX,
} from './constants.ts';
import type { GsiKey, TableKey } from './types.ts';

export type { GsiKey, Invite, TableKey } from './types.ts';

export const inviteKey = (email: string): TableKey => ({
  PK: `${INVITE_PK_PREFIX}${normaliseEmail(email)}`,
  SK: INVITE_SK,
});

export const profileKey = (sub: string): TableKey => ({
  PK: `${USER_PK_PREFIX}${sub}`,
  SK: PROFILE_SK,
});

export const membershipGsiKey = (sub: string): GsiKey => ({
  GSI1PK: `${USER_PK_PREFIX}${sub}`,
});

export const householdMetaKey = (id: string): TableKey => ({
  PK: `${HOUSEHOLD_PK_PREFIX}${id}`,
  SK: HOUSEHOLD_META_SK,
});

export const householdIdFromKey = (key: unknown): string | undefined =>
  typeof key === 'string' &&
  key.startsWith(HOUSEHOLD_PK_PREFIX) &&
  key.length > HOUSEHOLD_PK_PREFIX.length
    ? key.slice(HOUSEHOLD_PK_PREFIX.length)
    : undefined;
