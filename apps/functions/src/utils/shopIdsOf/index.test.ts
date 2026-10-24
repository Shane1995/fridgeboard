import { shopIdsOf } from './index.ts';

describe('shopIdsOf', () => {
  it('prefers the list of shops', () => {
    expect(shopIdsOf({ shopIds: ['a', 'b'], shopId: 'old' })).toEqual(['a', 'b']);
    expect(shopIdsOf({ shopIds: [] })).toEqual([]);
  });

  it('reads the single shop of an older row, with unsorted meaning none', () => {
    expect(shopIdsOf({ shopId: 'a' })).toEqual(['a']);
    expect(shopIdsOf({ shopId: 'unsorted' })).toEqual([]);
    expect(shopIdsOf({})).toEqual([]);
  });
});
