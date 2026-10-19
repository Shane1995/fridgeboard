import { DEFAULT_WEB_CONFIGURATION } from './constants.ts';
import { WebConfigurationSchema } from './index.ts';

describe('WebConfigurationSchema', () => {
  it('accepts the default configuration', () => {
    expect(WebConfigurationSchema.safeParse(DEFAULT_WEB_CONFIGURATION).success).toBe(true);
  });

  it('accepts a partial flag set and same-origin services', () => {
    const result = WebConfigurationSchema.safeParse({
      version: 1,
      featureFlags: { ENABLE_ADMIN_INVITES: true },
      services: { api: { url: '/api/{id}', params: { id: 'x' } } },
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
      { version: 1, featureFlags: {}, services: { a: { url: 'https://evil.example/x' } } },
    ],
    [
      'protocol-relative service url',
      { version: 1, featureFlags: {}, services: { a: { url: '//evil.example/x' } } },
    ],
    [
      'unknown service key',
      { version: 1, featureFlags: {}, services: { a: { url: '/x', token: 't' } } },
    ],
  ])('rejects %s', (_name, input) => {
    expect(WebConfigurationSchema.safeParse(input).success).toBe(false);
  });
});
