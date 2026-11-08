import type { LambdaConfiguration } from './lambdaConfigurationSchema/types.ts';

export type ConfigurationCache = {
  value: LambdaConfiguration;
  fetchedAt: number;
};
