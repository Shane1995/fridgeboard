import { ShopColor, UNSORTED_SHOP_ID, UNSORTED_SHOP_NAME } from '../../constants';
import type { Shop, GroupedItems, ListItem } from '../../types';
import { inShop } from '../inShop';

export const UNSORTED_SHOP: Shop = {
  id: UNSORTED_SHOP_ID,
  name: UNSORTED_SHOP_NAME,
  color: ShopColor.Slate,
  order: Number.MAX_SAFE_INTEGER,
};

export const groupItemsByShop = (
  shops: readonly Shop[],
  items: readonly ListItem[],
): GroupedItems => {
  const open = items.filter(({ checked }) => !checked);
  const sectionFor = (shop: Shop) => ({
    shop,
    items: open.filter((item) => inShop({ item, shopId: shop.id, shops })),
  });
  const unsorted = sectionFor(UNSORTED_SHOP);
  return {
    sections: [...(unsorted.items.length > 0 ? [unsorted] : []), ...shops.map(sectionFor)],
    checked: items.filter(({ checked }) => checked),
  };
};
