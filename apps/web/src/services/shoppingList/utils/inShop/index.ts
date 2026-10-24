import { UNSORTED_SHOP_ID } from '../../constants';
import type { InShopOptions } from './types';

// An item is in each of its shops that still exists; with none left it is in General.
export const inShop = ({ item, shopId, shops }: InShopOptions): boolean => {
  const known = item.shopIds.filter((id) => shops.some((shop) => shop.id === id));
  return shopId === UNSORTED_SHOP_ID ? known.length === 0 : known.includes(shopId);
};
