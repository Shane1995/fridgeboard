import * as z from 'zod/mini';
import { SETTING_BOUNDS } from './constants';

const required = (key: keyof typeof SETTING_BOUNDS) =>
  z.int().check(z.gte(SETTING_BOUNDS[key].min), z.lte(SETTING_BOUNDS[key].max));

export const WebSettingsSchema = z.strictObject({
  refreshLeadMs: required('refreshLeadMs'),
  refreshMinIntervalMs: required('refreshMinIntervalMs'),
  usernameMinLength: required('usernameMinLength'),
  usernameMaxLength: required('usernameMaxLength'),
});
