import { useQuery as useTanStackQuery } from '@tanstack/react-query';
import type { QueryOptions, QueryResult } from './types';

export const useQuery = <TData>({
  queryKey,
  queryFn,
  staleTime,
  enabled,
}: QueryOptions<TData>): QueryResult<TData> =>
  useTanStackQuery({
    queryKey,
    queryFn,
    ...(staleTime === undefined ? {} : { staleTime }),
    ...(enabled === undefined ? {} : { enabled }),
  });
