import { USER_PK_PREFIX } from '../constants.ts';
import type { GsiKey } from '../types.ts';

export const membershipGsiKey = (sub: string): GsiKey => ({
  GSI1PK: `${USER_PK_PREFIX}${sub}`,
});
