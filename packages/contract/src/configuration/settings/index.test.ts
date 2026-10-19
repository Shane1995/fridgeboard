import { DEFAULT_LAMBDA_SETTINGS, DEFAULT_WEB_SETTINGS } from './constants.ts';
import { LambdaSettingsSchema, WebSettingsSchema } from './index.ts';

describe('settings schemas', () => {
  it('accept their defaults and an empty object', () => {
    expect(WebSettingsSchema.safeParse(DEFAULT_WEB_SETTINGS).success).toBe(true);
    expect(WebSettingsSchema.safeParse({}).success).toBe(true);
    expect(LambdaSettingsSchema.safeParse(DEFAULT_LAMBDA_SETTINGS).success).toBe(true);
    expect(LambdaSettingsSchema.safeParse({}).success).toBe(true);
  });

  it.each([
    [5_000, true],
    [4_999, false],
    [300_000, true],
    [300_001, false],
  ])('bounds refreshLeadMs: %s -> %s', (value, ok) => {
    expect(WebSettingsSchema.safeParse({ refreshLeadMs: value }).success).toBe(ok);
  });

  it.each([
    [10_000, true],
    [9_999, false],
    [600_000, true],
    [600_001, false],
  ])('bounds refreshMinIntervalMs: %s -> %s', (value, ok) => {
    expect(WebSettingsSchema.safeParse({ refreshMinIntervalMs: value }).success).toBe(ok);
  });

  it.each([
    [2, true],
    [1, false],
    [8, true],
    [9, false],
  ])('bounds usernameMinLength: %s -> %s', (value, ok) => {
    expect(WebSettingsSchema.safeParse({ usernameMinLength: value }).success).toBe(ok);
    expect(LambdaSettingsSchema.safeParse({ usernameMinLength: value }).success).toBe(ok);
  });

  it.each([
    [8, true],
    [7, false],
    [32, true],
    [33, false],
  ])('bounds usernameMaxLength: %s -> %s', (value, ok) => {
    expect(WebSettingsSchema.safeParse({ usernameMaxLength: value }).success).toBe(ok);
    expect(LambdaSettingsSchema.safeParse({ usernameMaxLength: value }).success).toBe(ok);
  });
});
