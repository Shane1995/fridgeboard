import { isRecentAuth } from './index.ts';

const NOW_MS = 1_700_000_000_000;
const NOW_S = NOW_MS / 1000;

describe('isRecentAuth', () => {
  it('accepts a sign-in within five minutes', () => {
    expect(isRecentAuth({ auth_time: NOW_S - 299 }, NOW_MS)).toBe(true);
    expect(isRecentAuth({ auth_time: NOW_S - 300 }, NOW_MS)).toBe(true);
  });

  it('rejects an older sign-in', () => {
    expect(isRecentAuth({ auth_time: NOW_S - 301 }, NOW_MS)).toBe(false);
  });

  it('rejects an auth_time in the future', () => {
    expect(isRecentAuth({ auth_time: NOW_S + 60 }, NOW_MS)).toBe(false);
  });

  it('accepts a numeric string claim', () => {
    expect(isRecentAuth({ auth_time: String(NOW_S - 10) }, NOW_MS)).toBe(true);
  });

  it.each([{}, { auth_time: 'soon' }, { auth_time: null }, { auth_time: true }])(
    'rejects a missing or invalid claim %j',
    (claims) => {
      expect(isRecentAuth(claims, NOW_MS)).toBe(false);
    },
  );
});
