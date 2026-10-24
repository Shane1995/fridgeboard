import type { UseQueryResult } from '@tanstack/react-query';

export type QueryOptions<TData> = {
  queryKey: readonly [string, ...unknown[]];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
};

export type QueryResult<TData> = UseQueryResult<TData, Error>;
