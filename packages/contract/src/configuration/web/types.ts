import type * as z from 'zod/mini';
import type { WebConfigurationSchema } from './index.ts';
import type { WebFeatureFlag } from '../flags/types.ts';

export type WebConfigurationInput = z.infer<typeof WebConfigurationSchema>;

export type WebConfiguration = {
  version: 1;
  featureFlags: Record<WebFeatureFlag, boolean>;
  services: WebConfigurationInput['services'];
};
