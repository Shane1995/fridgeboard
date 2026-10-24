import { UNSORTED_SHOP_ID } from '@fridgeboard/contract/lists/constants';
import { ShopItemSchema } from '../items/shopItem/index.ts';
import { shopKey } from '../keys/shopKey/index.ts';
import type { ShopExistsOptions } from './types.ts';

export const shopExists = async ({ table, scope, shopId }: ShopExistsOptions): Promise<boolean> =>
  shopId === UNSORTED_SHOP_ID ||
  (await table.get(shopKey({ ...scope, shopId }), ShopItemSchema)) !== undefined;
