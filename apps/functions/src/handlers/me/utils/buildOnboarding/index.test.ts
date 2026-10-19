import { buildOnboarding } from './index.ts';

const base = { username: 'jess', canCreateHousehold: false, isAdmin: false, hasHousehold: false };

describe('buildOnboarding', () => {
  it('lists username and household for a creator who has done neither', () => {
    expect(buildOnboarding({ ...base, username: null, canCreateHousehold: true })).toEqual([
      { id: 'username', done: false },
      { id: 'household', done: false },
    ]);
  });

  it('marks username done and leaves household pending', () => {
    expect(buildOnboarding({ ...base, canCreateHousehold: true })).toEqual([
      { id: 'username', done: true },
      { id: 'household', done: false },
    ]);
  });

  it('marks everything done for a creator with a household', () => {
    expect(buildOnboarding({ ...base, canCreateHousehold: true, hasHousehold: true })).toEqual([
      { id: 'username', done: true },
      { id: 'household', done: true },
    ]);
  });

  it('offers admins the household section', () => {
    expect(buildOnboarding({ ...base, isAdmin: true })).toEqual([
      { id: 'username', done: true },
      { id: 'household', done: false },
    ]);
  });

  it('shows an invited joiner only the username section', () => {
    expect(buildOnboarding({ ...base, username: null, hasHousehold: true })).toEqual([
      { id: 'username', done: false },
    ]);
  });

  it('asks a user with no household and no permission for an invite', () => {
    expect(buildOnboarding(base)).toEqual([
      { id: 'username', done: true },
      { id: 'needs-invite', done: false },
    ]);
  });
});
