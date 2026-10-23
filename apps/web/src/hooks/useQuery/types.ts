import type { UseQueryResult } from '@tanstack/react-query';

export type QueryOptions<TData> = {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
  staleTime?: number;
  enabled?: boolean;
  retry?: number;
};

export type QueryResult<TData> = UseQueryResult<TData, Error>;
