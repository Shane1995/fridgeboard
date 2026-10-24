import { localCookie } from './index.ts';

describe('localCookie', () => {
  it('is HttpOnly and scoped to the auth path without the Secure flag', () => {
    const cookie = localCookie('fb_rt', 'v', 60);

    expect(cookie).toBe('fb_rt=v; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=60');
  });
});
