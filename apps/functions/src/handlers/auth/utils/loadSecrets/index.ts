import { CACHE_KEY } from './constants.ts';
import type { Secrets } from './types.ts';
import { fetchSecrets } from './utils/fetchSecrets/index.ts';

const cache = new Map<string, Promise<Secrets>>();

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
