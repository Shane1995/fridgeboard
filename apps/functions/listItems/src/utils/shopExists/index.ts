import { UNSORTED_SHOP_ID } from '@fridgeboard/contract/lists/constants';
import { getShop } from '@fridgeboard/lambda-kit/repository/shops/index.ts';
import type { ShopExistsOptions } from './types.ts';

export const shopExists = async ({ table, scope, shopId }: ShopExistsOptions): Promise<boolean> =>
  shopId === UNSORTED_SHOP_ID || (await getShop({ table, scope, shopId })) !== undefined;
