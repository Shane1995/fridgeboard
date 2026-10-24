import { CONFIGURATION_VERSION } from '../base/constants.ts';
import { DEFAULT_LAMBDA_FLAGS } from '../flags/constants.ts';
import { DEFAULT_LAMBDA_SETTINGS } from '../settings/constants.ts';
import type { LambdaConfiguration } from './types.ts';

export const ALLOWED_SERVICE_HOSTS: readonly string[] = [];

export const DEFAULT_LAMBDA_CONFIGURATION: LambdaConfiguration = {
  version: CONFIGURATION_VERSION,
  featureFlags: DEFAULT_LAMBDA_FLAGS,
  services: {},
  settings: DEFAULT_LAMBDA_SETTINGS,
};
