import { serialiseCookie } from './index.ts';

describe('serialiseCookie', () => {
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
});
