import { DEFAULT_LAMBDA_CONFIGURATION } from './constants.ts';
import { LambdaConfigurationSchema } from './index.ts';

describe('LambdaConfigurationSchema', () => {
  it('accepts the default configuration', () => {
    expect(LambdaConfigurationSchema.safeParse(DEFAULT_LAMBDA_CONFIGURATION).success).toBe(true);
  });

  it.each([
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
