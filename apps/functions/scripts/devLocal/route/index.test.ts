import { buildRoutes } from './index.ts';

const api = {
  basePath: '/api/{version}',
  params: { version: 'v2' },
  endpoints: {
    me: '/me',
    onboarding: '/me/onboarding',
    username: '/profile/name',
    households: '/households',
    requestCode: '/auth/start',
    verify: '/auth/verify',
    refresh: '/auth/refresh',
    signOut: '/auth/sign-out',
    passkeyStart: '/auth/passkey/start',
    passkeyVerify: '/auth/passkey/verify',
    passkeysComplete: '/auth/passkeys/complete',
    passkeysStart: '/auth/passkeys/start',
  },
};

describe('buildRoutes', () => {
  it('takes every path from the configuration', () => {
    const routes = buildRoutes(api);

    expect(routes.get('GET /api/v2/me')?.jwt).toBe(true);
    expect(routes.get('GET /api/v2/me/onboarding')?.jwt).toBe(true);
    expect(routes.get('GET /api/v2/households')?.jwt).toBe(true);
    expect(routes.get('PUT /api/v2/profile/name')?.jwt).toBe(true);
    expect(routes.get('POST /api/v2/households')?.jwt).toBe(true);
    expect(routes.get('POST /api/v2/auth/start')?.jwt).toBe(false);
    expect(routes.has('GET /api/v1/me')).toBe(false);
  });

  it('has no passkey routes', () => {
    expect([...buildRoutes(api).keys()].filter((key) => key.includes('passkey'))).toEqual([]);
  });
});
