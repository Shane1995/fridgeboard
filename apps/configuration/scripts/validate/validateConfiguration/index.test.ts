import { WebConfigurationSchema } from '../../../../web/src/services/configuration/schema/index.ts';
import { validateConfiguration } from './index.ts';

const target = { name: 'web', schema: WebConfigurationSchema };

const VALID = {
  featureFlags: {
    ENABLE_ADMIN_INVITES: false,
    ENABLE_HOUSEHOLD_INVITES: false,
    ENABLE_ITEM_DRAG: false,
    ENABLE_PASSKEYS: true,
    ENABLE_PULL_TO_REFRESH: false,
    ENABLE_SHOP_QUICK_ADD: false,
  },
  mutations: { default: { retry: 0, timeoutMs: 10000 } },
  queries: {
    default: {
      gcTimeMs: 300000,
      refetchOnWindowFocus: true,
      retry: 1,
      staleTimeMs: 30000,
      timeoutMs: 10000,
    },
  },
  services: {
    api: {
      endpoints: {
        householdInvites: '/api/v1/households/{householdId}/invites',
        householdMembers: '/api/v1/households/{householdId}/members',
        households: '/api/v1/households',
        listHistory: '/api/v1/households/{householdId}/lists/{listId}/history',
        listItem: '/api/v1/households/{householdId}/lists/{listId}/items/{itemId}',
        listItems: '/api/v1/households/{householdId}/lists/{listId}/items',
        listShop: '/api/v1/households/{householdId}/lists/{listId}/shops/{shopId}',
        listShops: '/api/v1/households/{householdId}/lists/{listId}/shops',
        listShopsOrder: '/api/v1/households/{householdId}/lists/{listId}/shops/order',
        me: '/api/v1/me',
        onboarding: '/api/v1/me/onboarding',
        onboardingSkip: '/api/v1/me/onboarding/{sectionId}/skip',
        passkeyStart: '/api/v1/auth/passkey/start',
        passkeyVerify: '/api/v1/auth/passkey/verify',
        passkeysComplete: '/api/v1/auth/passkeys/complete',
        passkeysStart: '/api/v1/auth/passkeys/start',
        refresh: '/api/v1/auth/refresh',
        requestCode: '/api/v1/auth/start',
        signOut: '/api/v1/auth/sign-out',
        username: '/api/v1/me/username',
        verify: '/api/v1/auth/verify',
      },
    },
  },
  settings: {
    refreshLeadMs: 60000,
    refreshMinIntervalMs: 60000,
    usernameMaxLength: 20,
    usernameMinLength: 3,
  },
  version: 2,
};

describe('validateConfiguration', () => {
  it('returns no errors for a valid document', () => {
    expect(validateConfiguration(target, JSON.stringify(VALID))).toEqual([]);
  });

  it('reports invalid JSON', () => {
    expect(validateConfiguration(target, '{')).toEqual(['web: invalid JSON']);
  });

  it('reports schema violations with their path', () => {
    const errors = validateConfiguration(
      target,
      JSON.stringify({ ...VALID, featureFlags: { ...VALID.featureFlags, TYPO: true } }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('web: featureFlags');
  });

  it('reports secrets alongside schema errors', () => {
    const errors = validateConfiguration(
      target,
      JSON.stringify({
        ...VALID,
        services: {
          api: { ...VALID.services.api, params: { token: 't' } },
        },
      }),
    );
    expect(errors).toContain('web: $.services.api.params.token: key name suggests a secret');
  });

  it('reports unsorted keys even when the schema passes', () => {
    const { version, ...rest } = VALID;
    expect(validateConfiguration(target, JSON.stringify({ version, ...rest }))).toEqual([
      'web: $: keys are not sorted',
    ]);
  });
});
