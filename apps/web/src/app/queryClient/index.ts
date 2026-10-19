import { QueryClient } from '@tanstack/query-core';
import { QUERY_RETRY_COUNT, QUERY_STALE_TIME_MS } from './constants';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: QUERY_RETRY_COUNT,
      refetchOnWindowFocus: true,
      staleTime: QUERY_STALE_TIME_MS,
    },
  },
});
