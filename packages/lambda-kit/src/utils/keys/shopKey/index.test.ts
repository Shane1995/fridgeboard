import { shopKey } from './index.ts';

describe('shopKey', () => {
  it('keys the shop under the household with the list in the sort key', () => {
    expect(shopKey({ householdId: 'hh-1', listId: 'main', shopId: 'abc' })).toEqual({
      PK: 'HH#hh-1',
      SK: 'SHOP#main#abc',
    });
  });
});
