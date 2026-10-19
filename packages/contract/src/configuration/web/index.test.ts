import { DEFAULT_WEB_CONFIGURATION } from './constants.ts';
import { WebConfigurationSchema } from './index.ts';

const BASE = { version: 1, featureFlags: {}, services: {} };

describe('WebConfigurationSchema', () => {
  it('accepts the default configuration', () => {
    expect(WebConfigurationSchema.safeParse(DEFAULT_WEB_CONFIGURATION).success).toBe(true);
  });

  it('accepts a partial flag set and same-origin services', () => {
    const result = WebConfigurationSchema.safeParse({
      version: 1,
      featureFlags: { ENABLE_ADMIN_INVITES: true },
      params: { version: 'v2' },
      services: { me: { url: '/api/{version}/{id}', params: { id: 'x' } } },
    });
    expect(result.success).toBe(true);
  });

  it('accepts settings, queries and mutations', () => {
    const result = WebConfigurationSchema.safeParse({
      version: 1,
      featureFlags: {},
      services: {},
      settings: { refreshLeadMs: 5_000, refreshMinIntervalMs: 600_000 },
      queries: {
        default: { staleTimeMs: 0, gcTimeMs: 3_600_000, retry: 5, refetchOnWindowFocus: false },
        me: { retry: 0 },
      },
      mutations: { default: { retry: 1 }, signOut: { retry: 0 } },
    });
    expect(result.success).toBe(true);
  });

  it.each([
    ['unknown flag', { version: 1, featureFlags: { NOPE: true }, services: {} }],
    ['unknown top-level key', { version: 1, featureFlags: {}, services: {}, extra: 1 }],
    ['wrong version', { version: 2, featureFlags: {}, services: {} }],
    [
      'non-boolean flag',
      { version: 1, featureFlags: { ENABLE_ADMIN_INVITES: 'yes' }, services: {} },
    ],
    [
      'absolute service url',
      { version: 1, featureFlags: {}, services: { me: { url: 'https://evil.example/x' } } },
    ],
    [
      'protocol-relative service url',
      { version: 1, featureFlags: {}, services: { me: { url: '//evil.example/x' } } },
    ],
    [
      'unknown service field',
      { version: 1, featureFlags: {}, services: { me: { url: '/api/x', token: 't' } } },
    ],
    [
      'unknown service name',
      { version: 1, featureFlags: {}, services: { other: { url: '/api/x' } } },
    ],
    [
      'service url outside /api/',
      { version: 1, featureFlags: {}, services: { me: { url: '/other/x' } } },
    ],
    ['unknown setting', { ...BASE, settings: { other: 1 } }],
    ['setting below its bound', { ...BASE, settings: { refreshLeadMs: 4_999 } }],
    ['setting above its bound', { ...BASE, settings: { refreshMinIntervalMs: 600_001 } }],
    ['fractional setting', { ...BASE, settings: { refreshLeadMs: 6_000.5 } }],
    ['unknown query name', { ...BASE, queries: { configuration: { retry: 1 } } }],
    ['unknown query field', { ...BASE, queries: { me: { other: 1 } } }],
    ['query retry above 5', { ...BASE, queries: { me: { retry: 6 } } }],
    ['negative stale time', { ...BASE, queries: { me: { staleTimeMs: -1 } } }],
    ['gc time above an hour', { ...BASE, queries: { default: { gcTimeMs: 3_600_001 } } }],
    ['non-boolean refetchOnWindowFocus', { ...BASE, queries: { me: { refetchOnWindowFocus: 1 } } }],
    ['unknown mutation name', { ...BASE, mutations: { other: { retry: 1 } } }],
    ['unknown mutation field', { ...BASE, mutations: { signOut: { staleTimeMs: 1 } } }],
    ['mutation retry above 5', { ...BASE, mutations: { default: { retry: 6 } } }],
    ['non-string param', { version: 1, featureFlags: {}, params: { version: 2 }, services: {} }],
  ])('rejects %s', (_name, input) => {
    expect(WebConfigurationSchema.safeParse(input).success).toBe(false);
  });
});
