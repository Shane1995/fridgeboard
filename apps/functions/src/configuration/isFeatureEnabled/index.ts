import { LambdaFeatureFlag } from '@fridgeboard/contract/configuration/flags/constants';
import { getConfiguration } from '../index.ts';

export const isFeatureEnabled = async (flag: LambdaFeatureFlag): Promise<boolean> =>
  (await getConfiguration()).featureFlags[flag] ?? false;
