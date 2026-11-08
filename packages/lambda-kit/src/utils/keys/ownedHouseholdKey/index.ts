import { OWNED_HOUSEHOLD_SK, USER_PK_PREFIX } from '../constants.ts';
import type { TableKey } from '../types.ts';

export const ownedHouseholdKey = (sub: string): TableKey => ({
  PK: `${USER_PK_PREFIX}${sub}`,
  SK: OWNED_HOUSEHOLD_SK,
});
