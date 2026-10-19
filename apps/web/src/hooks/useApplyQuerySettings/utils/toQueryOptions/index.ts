import type { QueryEntry } from '@fridgeboard/contract/configuration/queries/types';

export const toQueryOptions = ({
  staleTimeMs,
  gcTimeMs,
  retry,
  refetchOnWindowFocus,
}: QueryEntry) => ({
  ...(staleTimeMs === undefined ? {} : { staleTime: staleTimeMs }),
  ...(gcTimeMs === undefined ? {} : { gcTime: gcTimeMs }),
  ...(retry === undefined ? {} : { retry }),
  ...(refetchOnWindowFocus === undefined ? {} : { refetchOnWindowFocus }),
});
