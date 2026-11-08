import { DEFAULT_LAMBDA_SETTINGS } from './constants.ts';
import { LambdaSettingsSchema } from './index.ts';

describe('LambdaSettingsSchema', () => {
  it('accepts the defaults and an empty object', () => {
    expect(LambdaSettingsSchema.safeParse(DEFAULT_LAMBDA_SETTINGS).success).toBe(true);
    expect(LambdaSettingsSchema.safeParse({}).success).toBe(true);
  });

  it.each([
    [2, true],
    [1, false],
    [8, true],
    [9, false],
  ])('bounds usernameMinLength: %s -> %s', (value, ok) => {
    expect(LambdaSettingsSchema.safeParse({ usernameMinLength: value }).success).toBe(ok);
  });

  it.each([
    [8, true],
    [7, false],
    [32, true],
    [33, false],
  ])('bounds usernameMaxLength: %s -> %s', (value, ok) => {
    expect(LambdaSettingsSchema.safeParse({ usernameMaxLength: value }).success).toBe(ok);
  });
});
