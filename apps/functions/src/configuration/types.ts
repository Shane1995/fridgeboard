import type { LambdaConfiguration } from '@fridgeboard/contract/configuration/lambda/types';

export type ConfigurationCache = {
  value: LambdaConfiguration;
  fetchedAt: number;
};
