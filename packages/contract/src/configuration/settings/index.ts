import * as z from 'zod/mini';
import { SETTING_BOUNDS } from './constants.ts';

const boundedMs = (key: keyof typeof SETTING_BOUNDS) =>
  z.optional(z.int().check(z.gte(SETTING_BOUNDS[key].min), z.lte(SETTING_BOUNDS[key].max)));

export const WebSettingsSchema = z.strictObject({
  refreshLeadMs: boundedMs('refreshLeadMs'),
  refreshMinIntervalMs: boundedMs('refreshMinIntervalMs'),
});

export const LambdaSettingsSchema = z.strictObject({
  flowTtlMs: boundedMs('flowTtlMs'),
});
