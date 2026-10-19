import type { LambdaFeatureFlag } from '@fridgeboard/contract/configuration/flags/types';
import { getConfiguration } from '../index.ts';

export const isFeatureEnabled = async (flag: LambdaFeatureFlag): Promise<boolean> =>
  (await getConfiguration()).featureFlags[flag];
