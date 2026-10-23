import { WebConfigurationSchema } from '../../../../packages/contract/src/configuration/web/index.ts';

const ENDPOINTS = {
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
};

const VALID = {
  featureFlags: { ENABLE_ADMIN_INVITES: false, ENABLE_PASSKEYS: true },
  mutations: { default: { retry: 0, timeoutMs: 10_000 } },
  queries: {
    default: {
      gcTimeMs: 300_000,
      refetchOnWindowFocus: true,
      retry: 1,
      staleTimeMs: 30_000,
      timeoutMs: 10_000,
    },
  },
  services: {
    api: {
      basePath: '/api/{version}',
      endpoints: ENDPOINTS,
      params: { version: 'v1' },
    },
  },
  settings: {
    refreshLeadMs: 60_000,
    refreshMinIntervalMs: 60_000,
    usernameMaxLength: 20,
    usernameMinLength: 3,
  },
  version: 2,
};

const api = (patch: object) => ({
  ...VALID,
  services: { api: { ...VALID.services.api, ...patch } },
});

describe('WebConfigurationSchema', () => {
  it('accepts a complete configuration', () => {
    expect(WebConfigurationSchema.safeParse(VALID).success).toBe(true);
  });

  it('accepts named entries, endpoint overrides and the maximum me stale time', () => {
    const result = WebConfigurationSchema.safeParse({
      ...api({ endpointsConfig: { me: { timeoutMs: 1_000 }, verify: { timeoutMs: 30_000 } } }),
      mutations: { default: { retry: 2, timeoutMs: 1_000 }, signOut: { retry: 0 } },
      queries: { ...VALID.queries, me: { staleTimeMs: 300_000, timeoutMs: 5_000 } },
    });
    expect(result.success).toBe(true);
  });

  it.each([
    ['version 1', { ...VALID, version: 1 }],
    ['missing version', { ...VALID, version: undefined }],
    ['unknown top-level key', { ...VALID, extra: 1 }],
    ['top-level params', { ...VALID, params: { version: 'v1' } }],
    ['missing featureFlags', { ...VALID, featureFlags: undefined }],
    ['missing flag', { ...VALID, featureFlags: { ENABLE_PASSKEYS: true } }],
    ['unknown flag', { ...VALID, featureFlags: { ...VALID.featureFlags, NOPE: true } }],
    [
      'non-boolean flag',
      { ...VALID, featureFlags: { ...VALID.featureFlags, ENABLE_PASSKEYS: 'yes' } },
    ],
    ['missing settings', { ...VALID, settings: undefined }],
    ['missing setting', { ...VALID, settings: { refreshLeadMs: 60_000 } }],
    ['unknown setting', { ...VALID, settings: { ...VALID.settings, other: 1 } }],
    [
      'setting below its bound',
      { ...VALID, settings: { ...VALID.settings, refreshLeadMs: 4_999 } },
    ],
    [
      'setting above its bound',
      { ...VALID, settings: { ...VALID.settings, refreshMinIntervalMs: 600_001 } },
    ],
    ['fractional setting', { ...VALID, settings: { ...VALID.settings, refreshLeadMs: 6_000.5 } }],
    ['missing queries default', { ...VALID, queries: {} }],
    ['partial queries default', { ...VALID, queries: { default: { retry: 1 } } }],
    [
      'unknown query name',
      { ...VALID, queries: { ...VALID.queries, configuration: { retry: 1 } } },
    ],
    ['unknown query field', { ...VALID, queries: { ...VALID.queries, me: { other: 1 } } }],
    ['query retry above 5', { ...VALID, queries: { ...VALID.queries, me: { retry: 6 } } }],
    ['negative stale time', { ...VALID, queries: { ...VALID.queries, me: { staleTimeMs: -1 } } }],
    [
      'gc time above an hour',
      { ...VALID, queries: { default: { ...VALID.queries.default, gcTimeMs: 3_600_001 } } },
    ],
    [
      'me stale time above 5 minutes',
      { ...VALID, queries: { ...VALID.queries, me: { staleTimeMs: 300_001 } } },
    ],
    [
      'query timeout below 1 s',
      { ...VALID, queries: { default: { ...VALID.queries.default, timeoutMs: 999 } } },
    ],
    [
      'query timeout above 30 s',
      { ...VALID, queries: { ...VALID.queries, me: { timeoutMs: 30_001 } } },
    ],
    ['missing mutations default', { ...VALID, mutations: {} }],
    ['partial mutations default', { ...VALID, mutations: { default: { retry: 0 } } }],
    ['unknown mutation name', { ...VALID, mutations: { ...VALID.mutations, other: { retry: 1 } } }],
    [
      'startSignIn mutation entry',
      { ...VALID, mutations: { ...VALID.mutations, startSignIn: { retry: 0 } } },
    ],
    [
      'mutation retry above 2',
      { ...VALID, mutations: { default: { retry: 3, timeoutMs: 10_000 } } },
    ],
    [
      'mutation timeout above 30 s',
      { ...VALID, mutations: { default: { retry: 0, timeoutMs: 30_001 } } },
    ],
    ['services without api', { ...VALID, services: {} }],
    [
      'unknown service group',
      { ...VALID, services: { ...VALID.services, other: VALID.services.api } },
    ],
    ['missing endpoint', api({ endpoints: { me: '/me' } })],
    ['unknown endpoint', api({ endpoints: { ...VALID.services.api.endpoints, other: '/x' } })],
    [
      'renamed endpoint key start',
      api({ endpoints: { ...VALID.services.api.endpoints, start: '/auth/start' } }),
    ],
    ['unknown endpointsConfig key', api({ endpointsConfig: { other: { timeoutMs: 1_000 } } })],
    ['endpointsConfig timeout above 30 s', api({ endpointsConfig: { me: { timeoutMs: 30_001 } } })],
    ['endpointsConfig unknown field', api({ endpointsConfig: { me: { retry: 1 } } })],
    ['unknown api field', api({ extra: 1 })],
    ['absolute basePath', api({ basePath: 'https://evil.example/api' })],
    ['protocol-relative basePath', api({ basePath: '//evil.example/api' })],
    ['basePath outside /api/', api({ basePath: '/other/{version}' })],
    ['basePath with traversal', api({ basePath: '/api/../{version}' })],
    [
      'endpoint with traversal',
      api({ endpoints: { ...VALID.services.api.endpoints, me: '/../x' } }),
    ],
    ['endpoint with query', api({ endpoints: { ...VALID.services.api.endpoints, me: '/me?a=1' } })],
    [
      'endpoint with fragment',
      api({ endpoints: { ...VALID.services.api.endpoints, me: '/me#a' } }),
    ],
    ['endpoint with percent', api({ endpoints: { ...VALID.services.api.endpoints, me: '/%2e' } })],
    [
      'endpoint with backslash',
      api({ endpoints: { ...VALID.services.api.endpoints, me: '/me\\x' } }),
    ],
    [
      'endpoint with whitespace',
      api({ endpoints: { ...VALID.services.api.endpoints, me: '/me x' } }),
    ],
    [
      'endpoint with double slash',
      api({ endpoints: { ...VALID.services.api.endpoints, me: '//me' } }),
    ],
    [
      'endpoint without leading slash',
      api({ endpoints: { ...VALID.services.api.endpoints, me: 'me' } }),
    ],
    ['missing version param', api({ params: {} })],
    ['empty version param', api({ params: { version: '' } })],
    ['long version param', api({ params: { version: 'a'.repeat(17) } })],
    ['dotted version param', api({ params: { version: '..' } })],
    ['slash version param', api({ params: { version: 'a/b' } })],
    ['non-string version param', api({ params: { version: 2 } })],
    ['extra param', api({ params: { version: 'v1', other: 'x' } })],
  ])('rejects %s', (_name, input) => {
    expect(WebConfigurationSchema.safeParse(input).success).toBe(false);
  });
});
