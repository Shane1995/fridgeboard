import { UNSORTED_SHOP_ID } from '@fridgeboard/contract/lists/constants';
import type { ShopIdsOfOptions } from './types.ts';

export const shopIdsOf = ({ shopIds, shopId }: ShopIdsOfOptions): string[] => {
  if (shopIds !== undefined) {
    return shopIds;
  }
  return shopId === undefined || shopId === UNSORTED_SHOP_ID ? [] : [shopId];
};
