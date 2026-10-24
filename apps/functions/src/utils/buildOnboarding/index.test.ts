import { OnboardingSectionId } from './constants.ts';
import { buildOnboarding } from './index.ts';

const base = { username: 'jess', canCreateHousehold: false, isAdmin: false, hasHousehold: true };

describe('buildOnboarding', () => {
  it('lists username and household for a creator who has done neither', () => {
    expect(
      buildOnboarding({ ...base, username: null, canCreateHousehold: true, hasHousehold: false }),
    ).toEqual([{ id: OnboardingSectionId.Username }, { id: OnboardingSectionId.Household }]);
  });

  it('leaves only the household once the username is set', () => {
    expect(buildOnboarding({ ...base, canCreateHousehold: true, hasHousehold: false })).toEqual([
      { id: OnboardingSectionId.Household },
    ]);
  });

  it('returns nothing for a creator with a username and a household', () => {
    expect(buildOnboarding({ ...base, canCreateHousehold: true })).toEqual([]);
  });

  it('offers admins the household section', () => {
    expect(buildOnboarding({ ...base, isAdmin: true, hasHousehold: false })).toEqual([
      { id: OnboardingSectionId.Household },
    ]);
  });

  it('tells an uninvited user with no household to ask for an invite', () => {
    expect(buildOnboarding({ ...base, hasHousehold: false })).toEqual([
      { id: OnboardingSectionId.NeedsInvite },
    ]);
  });

  it('only asks an invited joiner for a username', () => {
    expect(buildOnboarding({ ...base, username: null })).toEqual([
      { id: OnboardingSectionId.Username },
    ]);
  });
});
