import * as z from 'zod/mini';
import { WEB_FEATURE_FLAGS } from '../flags/constants.ts';
import { MutationEntriesSchema } from '../mutations/index.ts';
import { QueryEntriesSchema } from '../queries/index.ts';
import { ApiServiceSchema } from '../services/index.ts';
import { WebSettingsSchema } from '../settings/index.ts';
import { WEB_CONFIGURATION_VERSION } from './constants.ts';

export const WebConfigurationSchema = z.strictObject({
  featureFlags: z.record(z.enum(WEB_FEATURE_FLAGS), z.boolean()),
  mutations: MutationEntriesSchema,
  queries: QueryEntriesSchema,
  services: z.strictObject({ api: ApiServiceSchema }),
  settings: WebSettingsSchema,
  version: z.literal(WEB_CONFIGURATION_VERSION),
});
