import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { CACHE_KEY, INVALID_SECRETS_ERROR } from './constants.ts';
import type { Secrets } from './types.ts';

const ssm = new SSMClient({});
const cache = new Map<string, Promise<Secrets>>();

const fetchSecrets = async (): Promise<Secrets> => {
  const { Parameter } = await ssm.send(
    new GetParameterCommand({ Name: process.env.SECRETS_PARAM, WithDecryption: true }),
  );
  const parsed: Partial<Record<keyof Secrets, unknown>> = JSON.parse(Parameter?.Value ?? '{}');
  const { userPoolId, clientId, clientSecret, flowKey } = parsed;
  if (
    typeof userPoolId !== 'string' ||
    typeof clientId !== 'string' ||
    typeof clientSecret !== 'string' ||
    typeof flowKey !== 'string'
  ) {
    throw new Error(INVALID_SECRETS_ERROR);
  }
  return { userPoolId, clientId, clientSecret, flowKey };
};

export const loadSecrets = (): Promise<Secrets> => {
  const cached = cache.get(CACHE_KEY);
  if (cached) {
    return cached;
  }
  const pending = fetchSecrets().catch((error: unknown) => {
    cache.delete(CACHE_KEY);
    throw error;
  });
  cache.set(CACHE_KEY, pending);
  return pending;
};
