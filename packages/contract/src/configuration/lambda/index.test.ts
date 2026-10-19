import { DEFAULT_LAMBDA_CONFIGURATION } from './constants.ts';
import { LambdaConfigurationSchema } from './index.ts';

describe('LambdaConfigurationSchema', () => {
  it('accepts the default configuration', () => {
    expect(LambdaConfigurationSchema.safeParse(DEFAULT_LAMBDA_CONFIGURATION).success).toBe(true);
  });

  it('accepts top-level params', () => {
    expect(
      LambdaConfigurationSchema.safeParse({
        version: 1,
        featureFlags: {},
        params: { version: 'v1' },
        services: {},
      }).success,
    ).toBe(true);
  });

  it('accepts a flow ttl within bounds', () => {
    expect(
      LambdaConfigurationSchema.safeParse({
        version: 1,
        featureFlags: {},
        services: {},
        settings: { flowTtlMs: 60_000 },
      }).success,
    ).toBe(true);
  });

  it.each([
    [
      'a flow ttl below 60s',
      { version: 1, featureFlags: {}, services: {}, settings: { flowTtlMs: 59_999 } },
    ],
    [
      'a flow ttl above 300s',
      { version: 1, featureFlags: {}, services: {}, settings: { flowTtlMs: 300_001 } },
    ],
    ['an unknown setting', { version: 1, featureFlags: {}, services: {}, settings: { other: 1 } }],
    ['any flag', { version: 1, featureFlags: { ENABLE_ADMIN_INVITES: true }, services: {} }],
    ['unknown top-level key', { version: 1, featureFlags: {}, services: {}, secret: 'x' }],
    [
      'non-allowlisted service host',
      { version: 1, featureFlags: {}, services: { a: { url: 'https://x.example/' } } },
    ],
  ])('rejects %s', (_name, input) => {
    expect(LambdaConfigurationSchema.safeParse(input).success).toBe(false);
  });
});
