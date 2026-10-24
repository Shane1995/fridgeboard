import { historyKey } from './index.ts';

describe('historyKey', () => {
  it('keys the entry by the trimmed, lower-cased name', () => {
    expect(historyKey('hh-1', 'main', '  Oat Milk ')).toEqual({
      PK: 'HH#hh-1',
      SK: 'HIST#main#oat milk',
    });
  });
});
