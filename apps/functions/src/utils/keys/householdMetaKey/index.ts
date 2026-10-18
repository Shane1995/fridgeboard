import { HOUSEHOLD_META_SK, HOUSEHOLD_PK_PREFIX } from '../constants.ts';
import type { TableKey } from '../types.ts';

export const householdMetaKey = (id: string): TableKey => ({
  PK: `${HOUSEHOLD_PK_PREFIX}${id}`,
  SK: HOUSEHOLD_META_SK,
});
