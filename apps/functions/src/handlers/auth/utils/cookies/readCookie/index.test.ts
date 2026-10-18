import { readCookie } from './index.ts';

describe('readCookie', () => {
  it('reads a named cookie from the event cookies', () => {
    expect(readCookie(['other=1', 'fb_rt=abc.def=='], 'fb_rt')).toBe('abc.def==');
  });

  it('reads a cookie from a combined cookie entry', () => {
    expect(readCookie(['other=1; fb_auth_flow=xyz'], 'fb_auth_flow')).toBe('xyz');
  });

  it('returns undefined when the cookie is missing or empty', () => {
    expect(readCookie(undefined, 'fb_rt')).toBeUndefined();
    expect(readCookie(['fb_rtx=1'], 'fb_rt')).toBeUndefined();
    expect(readCookie(['fb_rt='], 'fb_rt')).toBeUndefined();
  });
});
