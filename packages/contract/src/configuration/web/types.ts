import type * as z from 'zod/mini';
import type { WebConfigurationSchema } from './index.ts';
import type { WebFeatureFlag } from '../flags/types.ts';
import type { ServiceDefinition } from '../resolveServiceUrl/types.ts';
import type { WebService } from '../services/types.ts';

export type WebConfigurationInput = z.infer<typeof WebConfigurationSchema>;

export type WebConfiguration = {
  version: 1;
  featureFlags: Record<WebFeatureFlag, boolean>;
  params: Record<string, string>;
  services: Record<WebService, ServiceDefinition>;
};
