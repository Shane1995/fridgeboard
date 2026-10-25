import { OnboardingSectionId } from './constants.ts';
import { buildOnboarding } from './index.ts';

const base = {
  username: 'jess',
  canCreateHousehold: false,
  isAdmin: false,
  hasHousehold: true,
  skippedSections: [],
};

const required = (id: OnboardingSectionId) => ({ id, skippable: false });
const skippable = (id: OnboardingSectionId) => ({ id, skippable: true });

describe('buildOnboarding', () => {
  it('lists username and household for a creator who has done neither', () => {
    expect(
      buildOnboarding({ ...base, username: null, canCreateHousehold: true, hasHousehold: false }),
    ).toEqual([required(OnboardingSectionId.Username), skippable(OnboardingSectionId.Household)]);
  });

  it('leaves only the household once the username is set', () => {
    expect(buildOnboarding({ ...base, canCreateHousehold: true, hasHousehold: false })).toEqual([
      skippable(OnboardingSectionId.Household),
    ]);
  });

  it('returns nothing for a creator with a username and a household', () => {
    expect(buildOnboarding({ ...base, canCreateHousehold: true })).toEqual([]);
  });

  it('offers admins the household section', () => {
    expect(buildOnboarding({ ...base, isAdmin: true, hasHousehold: false })).toEqual([
      skippable(OnboardingSectionId.Household),
    ]);
  });

  it('tells an uninvited user with no household to ask for an invite', () => {
    expect(buildOnboarding({ ...base, hasHousehold: false })).toEqual([
      required(OnboardingSectionId.NeedsInvite),
    ]);
  });

  it('only asks an invited joiner for a username', () => {
    expect(buildOnboarding({ ...base, username: null })).toEqual([
      required(OnboardingSectionId.Username),
    ]);
  });

  it('stops offering the household section once it has been skipped', () => {
    expect(
      buildOnboarding({
        ...base,
        canCreateHousehold: true,
        hasHousehold: false,
        skippedSections: [OnboardingSectionId.Household],
      }),
    ).toEqual([]);
  });

  it('never lets the username be skipped', () => {
    expect(
      buildOnboarding({ ...base, username: null, skippedSections: [OnboardingSectionId.Username] }),
    ).toEqual([required(OnboardingSectionId.Username)]);
  });

  it('never lets the needs-invite notice be skipped', () => {
    expect(
      buildOnboarding({
        ...base,
        hasHousehold: false,
        skippedSections: [OnboardingSectionId.NeedsInvite],
      }),
    ).toEqual([required(OnboardingSectionId.NeedsInvite)]);
  });
});
