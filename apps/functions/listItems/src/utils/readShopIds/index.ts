import { MAX_SHOPS_PER_ITEM, UNSORTED_SHOP_ID } from '@fridgeboard/contract/lists/constants';
import { shopExists } from '../shopExists/index.ts';
import type { ReadShopIdsOptions, ReadShopIdsResult } from './types.ts';

// The shops of an item from a request body: `shopIds`, a list where empty means Unassigned.
export const readShopIds = async ({
  fields,
  table,
  scope,
}: ReadShopIdsOptions): Promise<ReadShopIdsResult> => {
  if (!('shopIds' in fields)) {
    return { status: 'absent' };
  }
  const requested = fields.shopIds;
  if (!Array.isArray(requested) || !requested.every((id) => typeof id === 'string')) {
    return { status: 'invalid' };
  }
  const shopIds = [...new Set(requested.filter((id) => id !== UNSORTED_SHOP_ID))];
  if (shopIds.length > MAX_SHOPS_PER_ITEM) {
    return { status: 'invalid' };
  }
  const known = await Promise.all(shopIds.map((shopId) => shopExists({ table, scope, shopId })));
  return known.every(Boolean) ? { status: 'ok', shopIds } : { status: 'invalid' };
};
