import * as z from 'zod/mini';
import { baseConfigurationShape, serviceSchemaFor } from '../base/index.ts';
import { isAllowedServiceUrl } from './isAllowedServiceUrl/index.ts';

export const LambdaConfigurationSchema = z.strictObject({
  ...baseConfigurationShape,
  featureFlags: z.strictObject({}),
  services: z.record(
    z.string(),
    serviceSchemaFor(
      z.string().check(z.refine(isAllowedServiceUrl, 'https url on an allowlisted host')),
    ),
  ),
});
