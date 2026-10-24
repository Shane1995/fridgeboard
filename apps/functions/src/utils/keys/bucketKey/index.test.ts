import { bucketKey } from './index.ts';

describe('bucketKey', () => {
  it('keys the bucket under the household with the list in the sort key', () => {
    expect(bucketKey({ householdId: 'hh-1', listId: 'main', bucketId: 'abc' })).toEqual({
      PK: 'HH#hh-1',
      SK: 'BUCKET#main#abc',
    });
  });
});
