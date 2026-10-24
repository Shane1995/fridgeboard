import { HouseholdRole } from '../isHouseholdRole/constants.ts';
import { householdRoles } from './index.ts';

describe('householdRoles', () => {
  it('maps household ids to roles in order', () => {
    const roles = householdRoles([
      { GSI1SK: 'HH#h1', role: HouseholdRole.Owner },
      { GSI1SK: 'HH#h2', role: HouseholdRole.Member },
    ]);

    expect([...roles]).toEqual([
      ['h1', HouseholdRole.Owner],
      ['h2', HouseholdRole.Member],
    ]);
  });

  it('keeps the first role for a duplicated household', () => {
    const roles = householdRoles([
      { GSI1SK: 'HH#h1', role: HouseholdRole.Owner },
      { GSI1SK: 'HH#h1', role: HouseholdRole.Member },
    ]);

    expect([...roles]).toEqual([['h1', HouseholdRole.Owner]]);
  });

  it('skips missing or malformed keys', () => {
    expect(
      householdRoles([{ role: HouseholdRole.Owner }, { GSI1SK: 'junk', role: HouseholdRole.Owner }])
        .size,
    ).toBe(0);
  });
});
