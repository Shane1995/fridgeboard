import { ownedHouseholdKey } from './index.ts';

describe('ownedHouseholdKey', () => {
  it('builds the per-user owned-household guard key', () => {
    expect(ownedHouseholdKey('abc')).toEqual({ PK: 'USER#abc', SK: 'OWNED_HOUSEHOLD' });
  });
});
