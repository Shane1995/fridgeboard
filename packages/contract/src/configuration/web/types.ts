import type * as z from 'zod/mini';
import type { WebConfigurationSchema } from './index.ts';
import { WebFeatureFlag } from '../flags/constants.ts';
import type { ServiceDefinition } from '../resolveServiceUrl/types.ts';
import type { MutationEntries } from '../mutations/types.ts';
import type { QueryEntries } from '../queries/types.ts';
import type { WebSettings } from '../settings/types.ts';
import { WebService } from '../services/constants.ts';

export type WebConfigurationInput = z.infer<typeof WebConfigurationSchema>;

export type WebConfiguration = {
  version: 1;
  featureFlags: Record<WebFeatureFlag, boolean>;
  params: Record<string, string>;
  services: Record<WebService, ServiceDefinition>;
  settings: WebSettings;
  queries: QueryEntries;
  mutations: MutationEntries;
};
