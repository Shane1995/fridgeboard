import { householdMetaKey } from './index.ts';

describe('householdMetaKey', () => {
  it('builds a household META key', () => {
    expect(householdMetaKey('h1')).toEqual({ PK: 'HH#h1', SK: 'META' });
  });
});
