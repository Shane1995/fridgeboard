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

  it('accepts the maximum me stale time and other queries up to an hour', () => {
    const result = WebConfigurationSchema.safeParse({
      ...BASE,
      queries: { me: { staleTimeMs: 300_000 }, default: { staleTimeMs: 3_600_000 } },
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
    ['mutation retry above 2', { ...BASE, mutations: { default: { retry: 3 } } }],
    ['service url with traversal', { ...BASE, services: { me: { url: '/api/../x' } } }],
    ['service url with percent', { ...BASE, services: { me: { url: '/api/%2e/x' } } }],
    ['service url with query', { ...BASE, services: { me: { url: '/api/x?a=1' } } }],
    ['service url with fragment', { ...BASE, services: { me: { url: '/api/x#a' } } }],
    ['service url with double slash', { ...BASE, services: { me: { url: '/api//x' } } }],
    ['service url with backslash', { ...BASE, services: { me: { url: '/api/x\\y' } } }],
    ['service url with whitespace', { ...BASE, services: { me: { url: '/api/x y' } } }],
    ['shared param empty value', { ...BASE, params: { version: '' } }],
    [
      'service param empty value',
      { ...BASE, services: { me: { url: '/api/x', params: { version: '' } } } },
    ],
    ['shared param long value', { ...BASE, params: { version: 'a'.repeat(17) } }],
    [
      'service param long value',
      { ...BASE, services: { me: { url: '/api/x', params: { version: 'a'.repeat(17) } } } },
    ],
    ['shared param dotted value', { ...BASE, params: { version: '..' } }],
    [
      'service param dotted value',
      { ...BASE, services: { me: { url: '/api/x', params: { version: '..' } } } },
    ],
    ['shared param slash value', { ...BASE, params: { version: 'a/b' } }],
    [
      'service param slash value',
      { ...BASE, services: { me: { url: '/api/x', params: { version: 'a/b' } } } },
    ],
    ['shared param digit-leading name', { ...BASE, params: { '1v': 'x' } }],
    [
      'service param digit-leading name',
      { ...BASE, services: { me: { url: '/api/x', params: { '1v': 'x' } } } },
    ],
    ['shared param long name', { ...BASE, params: { ['a'.repeat(33)]: 'x' } }],
    [
      'service param long name',
      { ...BASE, services: { me: { url: '/api/x', params: { ['a'.repeat(33)]: 'x' } } } },
    ],
    ['me stale time above 5 minutes', { ...BASE, queries: { me: { staleTimeMs: 300_001 } } }],
    ['startSignIn mutation entry', { ...BASE, mutations: { startSignIn: { retry: 0 } } }],
    ['verifyCode mutation entry', { ...BASE, mutations: { verifyCode: { retry: 0 } } }],
    ['non-string param', { version: 1, featureFlags: {}, params: { version: 2 }, services: {} }],
  ])('rejects %s', (_name, input) => {
    expect(WebConfigurationSchema.safeParse(input).success).toBe(false);
  });
});
