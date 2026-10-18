import { clearCookie, readCookie, serialiseCookie } from './index.ts';

describe('cookies', () => {
  it('serialises the refresh cookie exactly', () => {
    expect(serialiseCookie('fb_rt', 'token-1', 315360000)).toBe(
      'fb_rt=token-1; Secure; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=315360000',
    );
  });

  it('serialises the flow cookie exactly', () => {
    expect(serialiseCookie('fb_auth_flow', 'signed-1', 180)).toBe(
      'fb_auth_flow=signed-1; Secure; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=180',
    );
  });

  it('clears a cookie with an empty value and zero max-age', () => {
    expect(clearCookie('fb_rt')).toBe(
      'fb_rt=; Secure; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=0',
    );
  });

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
