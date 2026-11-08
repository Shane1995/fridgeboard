import * as z from 'zod/mini';
import { SETTING_BOUNDS } from './constants.ts';

const bounded = (key: keyof typeof SETTING_BOUNDS) =>
  z.optional(z.int().check(z.gte(SETTING_BOUNDS[key].min), z.lte(SETTING_BOUNDS[key].max)));

export const LambdaSettingsSchema = z.strictObject({
  flowTtlMs: bounded('flowTtlMs'),
  usernameMinLength: bounded('usernameMinLength'),
  usernameMaxLength: bounded('usernameMaxLength'),
});
