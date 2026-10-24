import { HOUSEHOLD_PK_PREFIX } from '../constants.ts';
import { historyPrefix } from '../historyPrefix/index.ts';
import type { TableKey } from '../types.ts';

export const historyKey = (householdId: string, listId: string, name: string): TableKey => ({
  PK: `${HOUSEHOLD_PK_PREFIX}${householdId}`,
  SK: `${historyPrefix(listId)}${name.trim().toLowerCase()}`,
});
