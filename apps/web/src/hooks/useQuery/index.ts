import { useQuery as useTanStackQuery } from '@tanstack/react-query';
import { mergedEntry } from '../../utils/mergedEntry';
import { toQueryOptions } from '../../utils/toQueryOptions';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import type { QueryOptions, QueryResult } from './types';

// Every setting comes from the remote configuration: its `default` entry, overridden by the
// entry named after the first element of the query key. Nothing is set in code.
export const useQuery = <TData>({
  queryKey,
  queryFn,
  enabled,
}: QueryOptions<TData>): QueryResult<TData> => {
  const { queries } = useRemoteConfigContext();
  return useTanStackQuery({
    queryKey,
    queryFn,
    ...toQueryOptions(mergedEntry(queries, queryKey[0])),
    ...(enabled === undefined ? {} : { enabled }),
  });
};
