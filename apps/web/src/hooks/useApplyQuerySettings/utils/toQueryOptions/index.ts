import type { QueryEntry } from '@fridgeboard/contract/configuration/queries/types';
import { retryUnlessClientError } from '../../../../utils/retryUnlessClientError';

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
