import type { UseQueryResult } from '@tanstack/react-query';

export type QueryOptions<TResponse, TData = TResponse> = {
  queryKey: readonly [string, ...unknown[]];
  queryFn: () => Promise<TResponse>;
  enabled?: boolean;
  select?: (response: TResponse) => TData;
};

export type QueryResult<TData> = UseQueryResult<TData, Error>;
