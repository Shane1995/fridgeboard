import { USERNAME_PK_PREFIX, USERNAME_SK } from '../constants.ts';
import type { TableKey } from '../types.ts';

export const usernameKey = (username: string): TableKey => ({
  PK: `${USERNAME_PK_PREFIX}${username.toLowerCase()}`,
  SK: USERNAME_SK,
});
