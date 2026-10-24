import { ShopColor, UNSORTED_SHOP_ID } from '../../constants';
import type { ListItem, Shop } from '../../types';
import { inShop } from './index';

const shops: Shop[] = [
  { id: 'express', name: 'Express', color: ShopColor.Mint, order: 0 },
  { id: 'ms', name: 'M&S', color: ShopColor.Sky, order: 1 },
];
const item = (shopIds: string[]): ListItem => ({
  id: 'i1',
  name: 'Milk',
  shopIds,
  checked: false,
  createdAt: 1,
});

describe('inShop', () => {
  it('is in every one of its shops', () => {
    const both = item(['express', 'ms']);

    expect(inShop({ item: both, shopId: 'express', shops })).toBe(true);
    expect(inShop({ item: both, shopId: 'ms', shops })).toBe(true);
    expect(inShop({ item: both, shopId: UNSORTED_SHOP_ID, shops })).toBe(false);
  });

  it('is in General when it has no shop, or only shops that are gone', () => {
    expect(inShop({ item: item([]), shopId: UNSORTED_SHOP_ID, shops })).toBe(true);
    expect(inShop({ item: item(['deleted']), shopId: UNSORTED_SHOP_ID, shops })).toBe(true);
    expect(inShop({ item: item(['deleted']), shopId: 'express', shops })).toBe(false);
  });

  it('stays out of the shops it does not list', () => {
    expect(inShop({ item: item(['express']), shopId: 'ms', shops })).toBe(false);
  });
});
