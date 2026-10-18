import type { UseMutationResult } from '@tanstack/react-query';

export type MutationOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
};

export type MutationResult<TData, TVariables> = UseMutationResult<TData, Error, TVariables>;
