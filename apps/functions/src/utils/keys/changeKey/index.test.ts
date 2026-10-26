import { changeKey } from './index.ts';

describe('changeKey', () => {
  it('keys the change under the household with the rev in the sort key', () => {
    expect(changeKey({ householdId: 'hh-1', rev: 42 })).toEqual({
      PK: 'HH#hh-1',
      SK: 'CHG#0000000042',
    });
  });

  it('pads the first rev', () => {
    expect(changeKey({ householdId: 'hh-1', rev: 1 }).SK).toBe('CHG#0000000001');
  });

  it('sorts keys in rev order as text', () => {
    const sorted = [10, 9, 100, 2].map((rev) => changeKey({ householdId: 'hh-1', rev }).SK).sort();

    expect(sorted).toEqual([
      'CHG#0000000002',
      'CHG#0000000009',
      'CHG#0000000010',
      'CHG#0000000100',
    ]);
  });
});
