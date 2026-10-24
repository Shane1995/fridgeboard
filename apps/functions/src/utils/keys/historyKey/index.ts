import { HOUSEHOLD_PK_PREFIX } from '../constants.ts';
import { historyPrefix } from '../historyPrefix/index.ts';
import type { TableKey } from '../types.ts';
import type { HistoryKeyOptions } from './types.ts';

export const historyKey = ({ householdId, listId, name }: HistoryKeyOptions): TableKey => ({
  PK: `${HOUSEHOLD_PK_PREFIX}${householdId}`,
  SK: `${historyPrefix(listId)}${name.trim().toLowerCase()}`,
});
