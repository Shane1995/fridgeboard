import { historyKey } from './index.ts';

describe('historyKey', () => {
  it('keys the entry by the trimmed, lower-cased name', () => {
    expect(historyKey({ householdId: 'hh-1', listId: 'main', name: '  Oat Milk ' })).toEqual({
      PK: 'HH#hh-1',
      SK: 'HIST#main#oat milk',
    });
  });
});
