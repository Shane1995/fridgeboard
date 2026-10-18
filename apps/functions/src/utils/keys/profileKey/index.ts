import { PROFILE_SK, USER_PK_PREFIX } from '../constants.ts';
import type { TableKey } from '../types.ts';

export const profileKey = (sub: string): TableKey => ({
  PK: `${USER_PK_PREFIX}${sub}`,
  SK: PROFILE_SK,
});
