import { clearCookie } from './index.ts';

describe('clearCookie', () => {
  it('clears a cookie with an empty value and zero max-age', () => {
    expect(clearCookie('fb_rt')).toBe(
      'fb_rt=; Secure; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=0',
    );
  });
});
