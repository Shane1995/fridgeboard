import type * as z from 'zod/mini';
import type { LambdaConfigurationSchema } from './index.ts';
import type { LambdaFeatureFlag } from '../flags/types.ts';

export type LambdaConfigurationInput = z.infer<typeof LambdaConfigurationSchema>;

export type LambdaConfiguration = {
  version: 1;
  featureFlags: Record<LambdaFeatureFlag, boolean>;
  services: LambdaConfigurationInput['services'];
};
