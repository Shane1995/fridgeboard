import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  DEFAULT_LAMBDA_FLAGS,
  LAMBDA_FEATURE_FLAGS,
} from '@fridgeboard/contract/configuration/flags/constants';
import { LambdaConfigurationSchema } from '@fridgeboard/contract/configuration/lambda';
import { DEFAULT_LAMBDA_CONFIGURATION } from '@fridgeboard/contract/configuration/lambda/constants';
import type { LambdaConfiguration } from '@fridgeboard/contract/configuration/lambda/types';
import {
  DEFAULT_LAMBDA_SETTINGS,
  LAMBDA_SETTINGS,
} from '@fridgeboard/contract/configuration/settings/constants';
import { mergeSettings } from '@fridgeboard/contract/configuration/settings/mergeSettings';
import { stripUnknownFlags } from '@fridgeboard/contract/configuration/stripUnknownFlags';
import { stripUnknownKeys } from '@fridgeboard/contract/configuration/stripUnknownKeys';
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
    stripUnknownKeys(stripUnknownFlags(raw, LAMBDA_FEATURE_FLAGS), 'settings', LAMBDA_SETTINGS),
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
