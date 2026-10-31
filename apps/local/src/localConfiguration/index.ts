import { readFileSync } from 'node:fs';
import {
  DEFAULT_LAMBDA_FLAGS,
  LAMBDA_FEATURE_FLAGS,
} from '../../../functions/src/configuration/flags/constants.ts';
import { LambdaConfigurationSchema } from '../../../functions/src/configuration/lambdaConfigurationSchema/index.ts';
import type { LambdaConfiguration } from '../../../functions/src/configuration/lambdaConfigurationSchema/types.ts';
import {
  DEFAULT_LAMBDA_SETTINGS,
  LAMBDA_SETTINGS,
} from '../../../functions/src/configuration/settings/constants.ts';
import { mergeSettings } from '../../../functions/src/configuration/settings/mergeSettings/index.ts';
import { stripTopLevelParams } from '../../../functions/src/configuration/stripTopLevelParams/index.ts';
import { stripUnknownFlags } from '../../../functions/src/configuration/stripUnknownFlags/index.ts';
import { stripUnknownKeys } from '../../../functions/src/configuration/stripUnknownKeys/index.ts';
import { API_PORT } from '../constants.ts';
import { LAMBDA_CONFIGURATION_FILE } from './constants.ts';

export const getConfiguration = async (): Promise<LambdaConfiguration> => {
  const raw: Record<string, unknown> = JSON.parse(readFileSync(LAMBDA_CONFIGURATION_FILE, 'utf8'));
  const parsed = LambdaConfigurationSchema.parse(
    stripUnknownKeys(
      stripUnknownFlags(stripTopLevelParams({ ...raw, services: {} }), LAMBDA_FEATURE_FLAGS),
      'settings',
      LAMBDA_SETTINGS,
    ),
  );
  return {
    ...parsed,
    featureFlags: { ...DEFAULT_LAMBDA_FLAGS, ...parsed.featureFlags },
    settings: mergeSettings(DEFAULT_LAMBDA_SETTINGS, parsed.settings),
    services: { appsyncEvents: { url: `http://127.0.0.1:${API_PORT}` } },
  };
};
