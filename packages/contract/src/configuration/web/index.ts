import * as z from 'zod/mini';
import { baseConfigurationShape, serviceSchemaFor } from '../base/index.ts';
import { WEB_FEATURE_FLAGS } from '../flags/constants.ts';
import { WEB_SERVICES } from '../services/constants.ts';
import { MutationEntriesSchema } from '../mutations/index.ts';
import { QueryEntriesSchema } from '../queries/index.ts';
import { WebSettingsSchema } from '../settings/index.ts';
import { API_URL_PATTERN, SAFE_URL_PATTERN, SAME_ORIGIN_PATH_PATTERN } from './constants.ts';

export const WebConfigurationSchema = z.strictObject({
  ...baseConfigurationShape,
  settings: z.optional(WebSettingsSchema),
  queries: z.optional(QueryEntriesSchema),
  mutations: z.optional(MutationEntriesSchema),
  featureFlags: z.partialRecord(z.enum(WEB_FEATURE_FLAGS), z.boolean()),
  services: z.partialRecord(
    z.enum(WEB_SERVICES),
    serviceSchemaFor(
      z
        .string()
        .check(
          z.regex(SAME_ORIGIN_PATH_PATTERN),
          z.regex(API_URL_PATTERN),
          z.regex(SAFE_URL_PATTERN),
        ),
    ),
  ),
});
