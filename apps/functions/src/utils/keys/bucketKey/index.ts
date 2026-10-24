import { bucketPrefix } from '../bucketPrefix/index.ts';
import { HOUSEHOLD_PK_PREFIX } from '../constants.ts';
import type { TableKey } from '../types.ts';

export const bucketKey = (householdId: string, listId: string, bucketId: string): TableKey => ({
  PK: `${HOUSEHOLD_PK_PREFIX}${householdId}`,
  SK: `${bucketPrefix(listId)}${bucketId}`,
});
