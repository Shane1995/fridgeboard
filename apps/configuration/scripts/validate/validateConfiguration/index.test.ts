import { WebConfigurationSchema } from '@fridgeboard/contract/configuration/web';
import { validateConfiguration } from './index.ts';

const target = { name: 'web', schema: WebConfigurationSchema };

const VALID = {
  featureFlags: { ENABLE_ADMIN_INVITES: false, ENABLE_PASSKEYS: true },
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
      basePath: '/api/{version}',
      endpoints: {
        households: '/households',
        me: '/me',
        passkeyStart: '/auth/passkey/start',
        passkeyVerify: '/auth/passkey/verify',
        passkeysComplete: '/auth/passkeys/complete',
        passkeysStart: '/auth/passkeys/start',
        refresh: '/auth/refresh',
        requestCode: '/auth/start',
        signOut: '/auth/sign-out',
        username: '/me/username',
        verify: '/auth/verify',
      },
      params: { version: 'v1' },
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

  it('reports secrets even when the schema passes', () => {
    const errors = validateConfiguration(
      target,
      JSON.stringify({
        ...VALID,
        services: {
          api: { ...VALID.services.api, params: { ...VALID.services.api.params, token: 't' } },
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
