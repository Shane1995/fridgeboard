import { HouseholdRole } from './constants.ts';
import { isHouseholdRole } from './index.ts';

describe('isHouseholdRole', () => {
  it.each(Object.values(HouseholdRole))('accepts %s', (role) => {
    expect(isHouseholdRole(role)).toBe(true);
  });

  it.each([undefined, null, '', 'admin', 'OWNER', 1])('rejects %s', (value) => {
    expect(isHouseholdRole(value)).toBe(false);
  });
});
