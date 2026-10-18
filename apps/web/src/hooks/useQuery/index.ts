import { useQuery as useTanStackQuery } from '@tanstack/react-query';
import type { QueryOptions, QueryResult } from './types';

export const useQuery = <TData>({ queryKey, queryFn }: QueryOptions<TData>): QueryResult<TData> =>
  useTanStackQuery({ queryKey, queryFn });
