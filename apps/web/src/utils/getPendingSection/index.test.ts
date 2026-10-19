import type { IMeResponse } from '@fridgeboard/contract/me';
import { getPendingSection } from '.';

const me = (onboarding: unknown): IMeResponse =>
  ({
    sub: 'sub-1',
    email: 'jess@example.com',
    username: 'jess',
    isAdmin: false,
    canCreateHousehold: false,
    households: [],
    onboarding,
  }) as IMeResponse;

describe('getPendingSection', () => {
  it('returns the first section that is not done', () => {
    expect(
      getPendingSection(
        me([
          { id: 'username', done: true },
          { id: 'household', done: false },
        ]),
      ),
    ).toBe('household');
  });

  it('returns undefined once every section is done', () => {
    expect(getPendingSection(me([{ id: 'username', done: true }]))).toBeUndefined();
  });

  it('skips sections this build does not know how to show', () => {
    expect(
      getPendingSection(
        me([
          { id: 'profile-photo', done: false },
          { id: 'household', done: false },
        ]),
      ),
    ).toBe('household');
  });
});
