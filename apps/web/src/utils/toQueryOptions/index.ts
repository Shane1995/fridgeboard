import type { QueryEntry } from '../../services/configuration/queries/types';
import { retryUnlessClientError } from '../retryUnlessClientError';

export const toQueryOptions = ({
  staleTimeMs,
  gcTimeMs,
  retry,
  refetchOnWindowFocus,
}: QueryEntry) => ({
  ...(staleTimeMs === undefined ? {} : { staleTime: staleTimeMs }),
  ...(gcTimeMs === undefined ? {} : { gcTime: gcTimeMs }),
  ...(retry === undefined ? {} : { retry: retryUnlessClientError(retry) }),
  ...(refetchOnWindowFocus === undefined ? {} : { refetchOnWindowFocus }),
});
