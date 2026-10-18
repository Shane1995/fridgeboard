import { householdRoles } from './index.ts';

describe('householdRoles', () => {
  it('maps household ids to roles in order', () => {
    const roles = householdRoles([
      { GSI1SK: 'HH#h1', role: 'owner' },
      { GSI1SK: 'HH#h2', role: 'member' },
    ]);

    expect([...roles]).toEqual([
      ['h1', 'owner'],
      ['h2', 'member'],
    ]);
  });

  it('keeps the first role for a duplicated household', () => {
    const roles = householdRoles([
      { GSI1SK: 'HH#h1', role: 'owner' },
      { GSI1SK: 'HH#h1', role: 'member' },
    ]);

    expect([...roles]).toEqual([['h1', 'owner']]);
  });

  it('skips missing or malformed keys', () => {
    expect(householdRoles([{ role: 'owner' }, { GSI1SK: 'junk', role: 'owner' }]).size).toBe(0);
  });
});
