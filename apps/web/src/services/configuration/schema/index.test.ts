import {
  MutationEntriesSchema,
  MutationEntrySchema,
  QueryEntriesSchema,
  QueryEntrySchema,
  ApiServiceSchema,
  WebConfigurationSchema,
  WebSettingsSchema,
} from '.';
import { WEB_FEATURE_FLAGS, WEB_SERVICES, WebFeatureFlag } from './constants';

describe('WebFeatureFlag schema', () => {
  describe('web feature flags', () => {
    it('lists every flag', () => {
      expect(WEB_FEATURE_FLAGS).toEqual(Object.keys(WebFeatureFlag));
    });
  });
});

describe('mutation entries schema', () => {
  const DEFAULT = { retry: 0, timeoutMs: 10_000 };

  describe('mutation entry schemas', () => {
    it('requires every key in the default entry', () => {
      expect(MutationEntriesSchema.safeParse({ default: DEFAULT }).success).toBe(true);
      expect(MutationEntriesSchema.safeParse({ default: { retry: 0 } }).success).toBe(false);
      expect(MutationEntriesSchema.safeParse({}).success).toBe(false);
    });

    it('accepts a partial signOut entry and rejects other names', () => {
      expect(
        MutationEntriesSchema.safeParse({ default: DEFAULT, signOut: { retry: 1 } }).success,
      ).toBe(true);
      expect(MutationEntriesSchema.safeParse({ default: DEFAULT, other: {} }).success).toBe(false);
    });

    it.each([
      [0, true],
      [2, true],
      [-1, false],
      [3, false],
    ])('bounds retry: %s -> %s', (value, ok) => {
      expect(MutationEntrySchema.safeParse({ retry: value }).success).toBe(ok);
    });
  });
});

describe('query entries schema', () => {
  const DEFAULT = {
    gcTimeMs: 300_000,
    refetchOnWindowFocus: true,
    retry: 1,
    staleTimeMs: 30_000,
    timeoutMs: 10_000,
  };

  describe('query entry schemas', () => {
    it.each([
      [0, true],
      [5, true],
      [-1, false],
      [6, false],
      [1.5, false],
    ])('bounds retry: %s -> %s', (value, ok) => {
      expect(QueryEntrySchema.safeParse({ retry: value }).success).toBe(ok);
    });

    it('accepts a partial named entry and rejects unknown keys', () => {
      expect(QueryEntrySchema.safeParse({ staleTimeMs: 1000, retry: 2 }).success).toBe(true);
      expect(QueryEntrySchema.safeParse({ nope: 1 }).success).toBe(false);
    });

    it('requires every key in the default entry', () => {
      expect(QueryEntriesSchema.safeParse({ default: DEFAULT }).success).toBe(true);
      expect(QueryEntriesSchema.safeParse({ default: { retry: 1 } }).success).toBe(false);
      expect(QueryEntriesSchema.safeParse({}).success).toBe(false);
    });

    it('rejects a me staleTimeMs above the allowed maximum', () => {
      expect(
        QueryEntriesSchema.safeParse({ default: DEFAULT, me: { staleTimeMs: 300_001 } }).success,
      ).toBe(false);
      expect(
        QueryEntriesSchema.safeParse({ default: DEFAULT, me: { staleTimeMs: 300_000 } }).success,
      ).toBe(true);
    });
  });
});

describe('api service schema', () => {
  const endpoints = Object.fromEntries(WEB_SERVICES.map((name) => [name, `/api/v1/${name}`]));
  const VALID = { endpoints };

  describe('ApiServiceSchema', () => {
    it('accepts a complete service', () => {
      expect(ApiServiceSchema.safeParse(VALID).success).toBe(true);
    });

    it.each(['me', '/me', '//me', '/api/me?x=1', '/api/../x'])(
      'rejects the endpoint path %s',
      (path) => {
        expect(
          ApiServiceSchema.safeParse({ ...VALID, endpoints: { ...endpoints, me: path } }).success,
        ).toBe(false);
      },
    );

    it('rejects a missing endpoint and an unknown endpoint', () => {
      const { me: _me, ...missing } = endpoints;

      expect(ApiServiceSchema.safeParse({ ...VALID, endpoints: missing }).success).toBe(false);
      expect(
        ApiServiceSchema.safeParse({ ...VALID, endpoints: { ...endpoints, nope: '/nope' } })
          .success,
      ).toBe(false);
    });

    it('accepts a per-endpoint timeout inside the bounds only', () => {
      const withTimeout = (timeoutMs: number) => ({
        ...VALID,
        endpointsConfig: { me: { timeoutMs } },
      });

      expect(ApiServiceSchema.safeParse(withTimeout(5_000)).success).toBe(true);
      expect(ApiServiceSchema.safeParse(withTimeout(500)).success).toBe(false);
    });
  });
});

describe('web settings schema', () => {
  const WEB = {
    refreshLeadMs: 60_000,
    refreshMinIntervalMs: 60_000,
    usernameMaxLength: 20,
    usernameMinLength: 3,
  };

  describe('WebSettingsSchema', () => {
    it('accepts a complete object and rejects an empty one', () => {
      expect(WebSettingsSchema.safeParse(WEB).success).toBe(true);
      expect(WebSettingsSchema.safeParse({}).success).toBe(false);
    });

    it.each([
      [5_000, true],
      [4_999, false],
      [300_000, true],
      [300_001, false],
    ])('bounds refreshLeadMs: %s -> %s', (value, ok) => {
      expect(WebSettingsSchema.safeParse({ ...WEB, refreshLeadMs: value }).success).toBe(ok);
    });

    it.each([
      [10_000, true],
      [9_999, false],
      [600_000, true],
      [600_001, false],
    ])('bounds refreshMinIntervalMs: %s -> %s', (value, ok) => {
      expect(WebSettingsSchema.safeParse({ ...WEB, refreshMinIntervalMs: value }).success).toBe(ok);
    });

    it.each([
      [2, true],
      [1, false],
      [8, true],
      [9, false],
    ])('bounds usernameMinLength: %s -> %s', (value, ok) => {
      expect(WebSettingsSchema.safeParse({ ...WEB, usernameMinLength: value }).success).toBe(ok);
    });

    it.each([
      [8, true],
      [7, false],
      [32, true],
      [33, false],
    ])('bounds usernameMaxLength: %s -> %s', (value, ok) => {
      expect(WebSettingsSchema.safeParse({ ...WEB, usernameMaxLength: value }).success).toBe(ok);
    });
  });
});

describe('web configuration schema', () => {
  const ENDPOINTS = {
    households: '/api/v1/households',
    me: '/api/v1/me',
    onboarding: '/api/v1/me/onboarding',
    passkeyStart: '/api/v1/auth/passkey/start',
    passkeyVerify: '/api/v1/auth/passkey/verify',
    passkeysComplete: '/api/v1/auth/passkeys/complete',
    passkeysStart: '/api/v1/auth/passkeys/start',
    refresh: '/api/v1/auth/refresh',
    requestCode: '/api/v1/auth/start',
    signOut: '/api/v1/auth/sign-out',
    username: '/api/v1/me/username',
    verify: '/api/v1/auth/verify',
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
        endpoints: ENDPOINTS,
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
      [
        'unknown mutation name',
        { ...VALID, mutations: { ...VALID.mutations, other: { retry: 1 } } },
      ],
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
      [
        'endpointsConfig timeout above 30 s',
        api({ endpointsConfig: { me: { timeoutMs: 30_001 } } }),
      ],
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
      [
        'endpoint with query',
        api({ endpoints: { ...VALID.services.api.endpoints, me: '/me?a=1' } }),
      ],
      [
        'endpoint with fragment',
        api({ endpoints: { ...VALID.services.api.endpoints, me: '/me#a' } }),
      ],
      [
        'endpoint with percent',
        api({ endpoints: { ...VALID.services.api.endpoints, me: '/%2e' } }),
      ],
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
});
