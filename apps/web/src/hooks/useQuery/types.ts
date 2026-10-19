import type { UseQueryResult } from '@tanstack/react-query';

export type QueryOptions<TData> = {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
  staleTime?: number;
};

export type QueryResult<TData> = UseQueryResult<TData, Error>;
