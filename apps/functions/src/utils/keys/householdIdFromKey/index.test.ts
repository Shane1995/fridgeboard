import { householdIdFromKey } from './index.ts';

describe('householdIdFromKey', () => {
  it('extracts a household id from a key', () => {
    expect(householdIdFromKey('HH#h1')).toBe('h1');
  });

  it.each(['', 'HH#', 'USER#h1', 'h1'])('returns undefined for %j', (value) => {
    expect(householdIdFromKey(value)).toBeUndefined();
  });

  it.each([undefined, 1, {}])('returns undefined for non-string %j', (value) => {
    expect(householdIdFromKey(value)).toBeUndefined();
  });
});
