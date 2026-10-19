import type { DefaultOptions } from '@tanstack/query-core';
import { retryUnlessClientError } from '../../utils/retryUnlessClientError';

const QUERY_STALE_TIME_MS = 30_000;
const QUERY_RETRY_COUNT = 1;

export const BASE_DEFAULT_OPTIONS: DefaultOptions = {
  queries: {
    retry: retryUnlessClientError(QUERY_RETRY_COUNT),
    refetchOnWindowFocus: true,
    staleTime: QUERY_STALE_TIME_MS,
  },
};
