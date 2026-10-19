import type { IMeResponse } from '@fridgeboard/contract/me';
import { completeOnboardingSection } from '.';

const me: IMeResponse = {
  sub: 'sub-1',
  email: 'jess@example.com',
  username: null,
  isAdmin: false,
  canCreateHousehold: true,
  households: [],
  onboarding: [
    { id: 'username', done: false },
    { id: 'household', done: false },
  ],
};

describe('completeOnboardingSection', () => {
  it('marks only the given section done', () => {
    expect(completeOnboardingSection(me, 'username').onboarding).toEqual([
      { id: 'username', done: true },
      { id: 'household', done: false },
    ]);
  });

  it('does not mutate the original', () => {
    completeOnboardingSection(me, 'username');

    expect(me.onboarding[0]?.done).toBe(false);
  });
});
