export const WEB_SETTING = {
  refreshLeadMs: 'refreshLeadMs',
  refreshMinIntervalMs: 'refreshMinIntervalMs',
  usernameMinLength: 'usernameMinLength',
  usernameMaxLength: 'usernameMaxLength',
} as const;

export const SETTING_BOUNDS = {
  refreshLeadMs: { min: 5_000, max: 300_000 },
  refreshMinIntervalMs: { min: 10_000, max: 600_000 },
  usernameMinLength: { min: 2, max: 8 },
  usernameMaxLength: { min: 8, max: 32 },
} as const;
