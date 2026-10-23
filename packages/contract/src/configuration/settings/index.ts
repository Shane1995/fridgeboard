import * as z from 'zod/mini';
import { SETTING_BOUNDS } from './constants.ts';

const required = (key: keyof typeof SETTING_BOUNDS) =>
  z.int().check(z.gte(SETTING_BOUNDS[key].min), z.lte(SETTING_BOUNDS[key].max));

const bounded = (key: keyof typeof SETTING_BOUNDS) => z.optional(required(key));

export const WebSettingsSchema = z.strictObject({
  refreshLeadMs: required('refreshLeadMs'),
  refreshMinIntervalMs: required('refreshMinIntervalMs'),
  usernameMinLength: required('usernameMinLength'),
  usernameMaxLength: required('usernameMaxLength'),
});

export const LambdaSettingsSchema = z.strictObject({
  flowTtlMs: bounded('flowTtlMs'),
  usernameMinLength: bounded('usernameMinLength'),
  usernameMaxLength: bounded('usernameMaxLength'),
});
