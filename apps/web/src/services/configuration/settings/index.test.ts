import { WebSettingsSchema } from './index';

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
