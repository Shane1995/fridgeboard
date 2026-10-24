import { LambdaFeatureFlag } from '../flags/constants.ts';
import { getConfiguration } from '../index.ts';

export const isFeatureEnabled = async (flag: LambdaFeatureFlag): Promise<boolean> =>
  (await getConfiguration()).featureFlags[flag] ?? false;
