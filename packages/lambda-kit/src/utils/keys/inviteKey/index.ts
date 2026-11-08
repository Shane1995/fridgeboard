import { normaliseEmail } from '../../normaliseEmail/index.ts';
import { INVITE_PK_PREFIX, INVITE_SK } from '../constants.ts';
import type { TableKey } from '../types.ts';

export const inviteKey = (email: string): TableKey => ({
  PK: `${INVITE_PK_PREFIX}${normaliseEmail(email)}`,
  SK: INVITE_SK,
});
