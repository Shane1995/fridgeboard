import type { LambdaSettings, WebSettings } from './types.ts';

export const WEB_SETTING = {
  refreshLeadMs: 'refreshLeadMs',
  refreshMinIntervalMs: 'refreshMinIntervalMs',
} as const;

export const LAMBDA_SETTING = {
  flowTtlMs: 'flowTtlMs',
} as const;

export const WEB_SETTINGS = Object.values(WEB_SETTING);

export const LAMBDA_SETTINGS = Object.values(LAMBDA_SETTING);

export const SETTING_BOUNDS = {
  refreshLeadMs: { min: 5_000, max: 300_000 },
  refreshMinIntervalMs: { min: 10_000, max: 600_000 },
  flowTtlMs: { min: 60_000, max: 600_000 },
} as const;

export const DEFAULT_WEB_SETTINGS: WebSettings = {
  refreshLeadMs: 60_000,
  refreshMinIntervalMs: 60_000,
};

export const DEFAULT_LAMBDA_SETTINGS: LambdaSettings = {
  flowTtlMs: 180_000,
};
