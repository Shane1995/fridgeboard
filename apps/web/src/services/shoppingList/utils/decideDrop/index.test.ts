import { UNSORTED_SHOP_ID } from '../../constants';
import type { ListItem } from '../../types';
import { decideDrop } from './index';

const item = (shopIds: string[]): ListItem => ({
  id: 'i1',
  name: 'Apples',
  shopIds,
  checked: false,
  createdAt: 1,
});

describe('decideDrop', () => {
  it('does nothing when dropped back on the same shop', () => {
    expect(decideDrop({ item: item(['a']), fromShopId: 'a', toShopId: 'a' })).toEqual({
      kind: 'none',
    });
    expect(
      decideDrop({ item: item([]), fromShopId: UNSORTED_SHOP_ID, toShopId: UNSORTED_SHOP_ID }),
    ).toEqual({ kind: 'none' });
  });

  it('assigns an unassigned item to the shop it is dropped on', () => {
    expect(decideDrop({ item: item([]), fromShopId: UNSORTED_SHOP_ID, toShopId: 'b' })).toEqual({
      kind: 'assign',
    });
  });

  it('takes an item out of a shop when dropped on Unassigned', () => {
    expect(decideDrop({ item: item(['a']), fromShopId: 'a', toShopId: UNSORTED_SHOP_ID })).toEqual({
      kind: 'unassign',
    });
  });

  it('says so when the item is already in the shop it is dropped on', () => {
    expect(decideDrop({ item: item(['a', 'b']), fromShopId: 'a', toShopId: 'b' })).toEqual({
      kind: 'already',
    });
  });

  it('asks what to do when an item is dragged from one shop to another', () => {
    expect(decideDrop({ item: item(['a']), fromShopId: 'a', toShopId: 'b' })).toEqual({
      kind: 'ask',
    });
  });
});
