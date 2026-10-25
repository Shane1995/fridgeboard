import { buildRoutes } from './index.ts';

const api = {
  endpoints: {
    me: '/api/v2/me',
    onboarding: '/api/v2/me/onboarding',
    onboardingSkip: '/api/v2/me/onboarding/{sectionId}/skip',
    username: '/api/v2/profile/name',
    households: '/api/v2/households',
    householdInvites: '/api/v2/households/{householdId}/invites',
    householdMembers: '/api/v2/households/{householdId}/members',
    listShop: '/api/v2/households/{householdId}/lists/{listId}/shops/{shopId}',
    listShops: '/api/v2/households/{householdId}/lists/{listId}/shops',
    listShopsOrder: '/api/v2/households/{householdId}/lists/{listId}/shops/order',
    listHistory: '/api/v2/households/{householdId}/lists/{listId}/history',
    listItem: '/api/v2/households/{householdId}/lists/{listId}/items/{itemId}',
    listItems: '/api/v2/households/{householdId}/lists/{listId}/items',
    requestCode: '/api/v2/auth/start',
    verify: '/api/v2/auth/verify',
    refresh: '/api/v2/auth/refresh',
    signOut: '/api/v2/auth/sign-out',
    passkeyStart: '/api/v2/auth/passkey/start',
    passkeyVerify: '/api/v2/auth/passkey/verify',
    passkeysComplete: '/api/v2/auth/passkeys/complete',
    passkeysStart: '/api/v2/auth/passkeys/start',
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

  it('serves the list, shop, history and member routes by their templated paths', () => {
    const keys = [...buildRoutes(api).keys()];

    expect(keys).toEqual(
      expect.arrayContaining([
        'GET /api/v2/households/{householdId}/lists/{listId}/items',
        'PATCH /api/v2/households/{householdId}/lists/{listId}/items/{itemId}',
        'PUT /api/v2/households/{householdId}/lists/{listId}/shops/order',
        'DELETE /api/v2/households/{householdId}/lists/{listId}/shops/{shopId}',
        'GET /api/v2/households/{householdId}/lists/{listId}/history',
        'GET /api/v2/households/{householdId}/members',
        'POST /api/v2/households/{householdId}/invites',
      ]),
    );
  });

  it('has no passkey routes', () => {
    expect([...buildRoutes(api).keys()].filter((key) => key.includes('passkey'))).toEqual([]);
  });
});
