import type { LambdaSettings } from './types.ts';

export const WEB_SETTING = {
  refreshLeadMs: 'refreshLeadMs',
  refreshMinIntervalMs: 'refreshMinIntervalMs',
  usernameMinLength: 'usernameMinLength',
  usernameMaxLength: 'usernameMaxLength',
} as const;

export const LAMBDA_SETTING = {
  flowTtlMs: 'flowTtlMs',
  usernameMinLength: 'usernameMinLength',
  usernameMaxLength: 'usernameMaxLength',
} as const;

export const LAMBDA_SETTINGS = Object.values(LAMBDA_SETTING);

export const SETTING_BOUNDS = {
  refreshLeadMs: { min: 5_000, max: 300_000 },
  refreshMinIntervalMs: { min: 10_000, max: 600_000 },
  flowTtlMs: { min: 60_000, max: 300_000 },
  usernameMinLength: { min: 2, max: 8 },
  usernameMaxLength: { min: 8, max: 32 },
} as const;

export const DEFAULT_LAMBDA_SETTINGS: LambdaSettings = {
  flowTtlMs: 180_000,
  usernameMinLength: 3,
  usernameMaxLength: 20,
};
