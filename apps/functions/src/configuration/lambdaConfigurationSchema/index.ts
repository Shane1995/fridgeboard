import * as z from 'zod/mini';
import { baseConfigurationShape, serviceSchemaFor } from '../base/index.ts';
import { LambdaSettingsSchema } from '../settings/index.ts';
import { isAllowedServiceUrl } from './isAllowedServiceUrl/index.ts';

export const LambdaConfigurationSchema = z.strictObject({
  ...baseConfigurationShape,
  settings: z.optional(LambdaSettingsSchema),
  featureFlags: z.strictObject({}),
  services: z.record(
    z.string(),
    serviceSchemaFor(
      z.string().check(z.refine(isAllowedServiceUrl, 'https url on an allowlisted host')),
    ),
  ),
});
