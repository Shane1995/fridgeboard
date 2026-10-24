import { HOUSEHOLD_PK_PREFIX } from '../constants.ts';
import { itemPrefix } from '../itemPrefix/index.ts';
import type { TableKey } from '../types.ts';

export const itemKey = (householdId: string, listId: string, itemId: string): TableKey => ({
  PK: `${HOUSEHOLD_PK_PREFIX}${householdId}`,
  SK: `${itemPrefix(listId)}${itemId}`,
});
