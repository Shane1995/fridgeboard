import { sessionResponse } from './index.ts';

const REFRESH_COOKIE =
  'fb_rt=refresh-1; Secure; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=315360000';

describe('sessionResponse', () => {
  it('returns the access token and sets the refresh cookie', () => {
    expect(
      sessionResponse({ AccessToken: 'access-1', ExpiresIn: 900, RefreshToken: 'refresh-1' }, [
        'a=1',
      ]),
    ).toEqual({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"accessToken":"access-1","expiresIn":900}',
      cookies: [REFRESH_COOKIE, 'a=1'],
    });
  });

  it('throws when tokens are missing', () => {
    expect(() => sessionResponse({ AccessToken: 'access-1', ExpiresIn: 900 })).toThrow(
      'MISSING_TOKENS',
    );
    expect(() => sessionResponse(undefined)).toThrow('MISSING_TOKENS');
  });
});
