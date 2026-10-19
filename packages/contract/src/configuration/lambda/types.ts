import type * as z from 'zod/mini';
import type { LambdaConfigurationSchema } from './index.ts';
import type { LambdaSettings } from '../settings/types.ts';
import { LambdaFeatureFlag } from '../flags/constants.ts';

export type LambdaConfigurationInput = z.infer<typeof LambdaConfigurationSchema>;

export type LambdaConfiguration = {
  version: 1;
  featureFlags: Record<LambdaFeatureFlag, boolean>;
  params?: LambdaConfigurationInput['params'];
  services: LambdaConfigurationInput['services'];
  settings: LambdaSettings;
};
