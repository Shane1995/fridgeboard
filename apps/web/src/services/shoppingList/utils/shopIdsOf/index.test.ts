import { ShopColor } from '../../constants';
import { shopIdsOf } from './index';

describe('shopIdsOf', () => {
  it('lists the ids of the shops an item is in, in order', () => {
    const shops = [
      { id: 'b', name: 'Lidl', color: ShopColor.Mint, order: 1 },
      { id: 'a', name: 'Aldi', color: ShopColor.Sky, order: 0 },
    ];

    expect(shopIdsOf({ shops })).toEqual(['b', 'a']);
  });

  it('is empty for an item in no shop', () => {
    expect(shopIdsOf({ shops: [] })).toEqual([]);
  });
});
