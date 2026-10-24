import { HOUSEHOLD_PK_PREFIX } from '../constants.ts';
import { itemPrefix } from '../itemPrefix/index.ts';
import type { TableKey } from '../types.ts';
import type { ItemKeyOptions } from './types.ts';

export const itemKey = ({ householdId, listId, itemId }: ItemKeyOptions): TableKey => ({
  PK: `${HOUSEHOLD_PK_PREFIX}${householdId}`,
  SK: `${itemPrefix(listId)}${itemId}`,
});
