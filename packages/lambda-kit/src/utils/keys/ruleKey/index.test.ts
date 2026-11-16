import { ruleKey } from './index.ts';

describe('ruleKey', () => {
  it('keeps a household’s rules under one prefix', () => {
    expect(ruleKey({ householdId: 'hh-1', ruleId: 'r-1' })).toEqual({
      PK: 'HH#hh-1',
      SK: 'RULE#r-1',
    });
  });
});
