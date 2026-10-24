import { itemKey } from './index.ts';

describe('itemKey', () => {
  it('keys the item under the household with the list in the sort key', () => {
    expect(itemKey('hh-1', 'main', 'abc')).toEqual({ PK: 'HH#hh-1', SK: 'ITEM#main#abc' });
  });
});
