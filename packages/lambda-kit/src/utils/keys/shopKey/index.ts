import { HOUSEHOLD_PK_PREFIX } from '../constants.ts';
import { shopPrefix } from '../shopPrefix/index.ts';
import type { TableKey } from '../types.ts';
import type { ShopKeyOptions } from './types.ts';

export const shopKey = ({ householdId, listId, shopId }: ShopKeyOptions): TableKey => ({
  PK: `${HOUSEHOLD_PK_PREFIX}${householdId}`,
  SK: `${shopPrefix(listId)}${shopId}`,
});
