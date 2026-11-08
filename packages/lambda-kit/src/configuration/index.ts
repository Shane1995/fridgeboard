import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { DEFAULT_LAMBDA_FLAGS, LAMBDA_FEATURE_FLAGS } from './flags/constants.ts';
import { LambdaConfigurationSchema } from './lambdaConfigurationSchema/index.ts';
import { DEFAULT_LAMBDA_CONFIGURATION } from './lambdaConfigurationSchema/constants.ts';
import type { LambdaConfiguration } from './lambdaConfigurationSchema/types.ts';
import { DEFAULT_LAMBDA_SETTINGS, LAMBDA_SETTINGS } from './settings/constants.ts';
import { mergeSettings } from './settings/mergeSettings/index.ts';
import { stripTopLevelParams } from './stripTopLevelParams/index.ts';
import { stripUnknownFlags } from './stripUnknownFlags/index.ts';
import { stripUnknownKeys } from './stripUnknownKeys/index.ts';
import { CONFIGURATION_TTL_MS, DEFAULT_CONFIG_KEY } from './constants.ts';
import type { ConfigurationCache } from './types.ts';

const client = new S3Client({});

const cache: ConfigurationCache = { value: DEFAULT_LAMBDA_CONFIGURATION, fetchedAt: -Infinity };

const fetchConfiguration = async (): Promise<LambdaConfiguration> => {
  const { Body } = await client.send(
    new GetObjectCommand({
      Bucket: process.env['CONFIG_BUCKET'],
      Key: process.env['CONFIG_KEY'] ?? DEFAULT_CONFIG_KEY,
    }),
  );
  const raw: unknown = JSON.parse((await Body?.transformToString()) ?? '');
  const parsed = LambdaConfigurationSchema.parse(
    stripUnknownKeys(
      stripUnknownFlags(stripTopLevelParams(raw), LAMBDA_FEATURE_FLAGS),
      'settings',
      LAMBDA_SETTINGS,
    ),
  );
  return {
    ...parsed,
    featureFlags: { ...DEFAULT_LAMBDA_FLAGS, ...parsed.featureFlags },
    settings: mergeSettings(DEFAULT_LAMBDA_SETTINGS, parsed.settings),
  };
};

export const getConfiguration = async (): Promise<LambdaConfiguration> => {
  const now = Date.now();
  if (now - cache.fetchedAt < CONFIGURATION_TTL_MS) {
    return cache.value;
  }
  try {
    cache.value = await fetchConfiguration();
  } catch (error) {
    console.error('configuration refresh failed', error);
  }
  cache.fetchedAt = now;
  return cache.value;
};
