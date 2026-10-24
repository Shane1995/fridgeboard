import * as z from 'zod/mini';
import { WEB_FEATURE_FLAGS } from '../flags/constants';
import { MutationEntriesSchema } from '../mutations';
import { QueryEntriesSchema } from '../queries';
import { ApiServiceSchema } from '../services';
import { WebSettingsSchema } from '../settings';
import { WEB_CONFIGURATION_VERSION } from './constants';

export const WebConfigurationSchema = z.strictObject({
  featureFlags: z.record(z.enum(WEB_FEATURE_FLAGS), z.boolean()),
  mutations: MutationEntriesSchema,
  queries: QueryEntriesSchema,
  services: z.strictObject({ api: ApiServiceSchema }),
  settings: WebSettingsSchema,
  version: z.literal(WEB_CONFIGURATION_VERSION),
});
