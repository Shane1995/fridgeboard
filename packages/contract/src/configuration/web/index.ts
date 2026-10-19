import * as z from 'zod/mini';
import { baseConfigurationShape, serviceSchemaFor } from '../base/index.ts';
import { WEB_FEATURE_FLAGS } from '../flags/constants.ts';
import { SAME_ORIGIN_PATH_PATTERN } from './constants.ts';

export const WebConfigurationSchema = z.strictObject({
  ...baseConfigurationShape,
  featureFlags: z.partialRecord(z.enum(WEB_FEATURE_FLAGS), z.boolean()),
  services: z.record(
    z.string(),
    serviceSchemaFor(z.string().check(z.regex(SAME_ORIGIN_PATH_PATTERN))),
  ),
});
