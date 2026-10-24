import type { UseMutationResult } from '@tanstack/react-query';

export type MutationOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  mutationKey: readonly [string, ...unknown[]];
  // Only set for mutations that are safe to repeat. Everything else is never retried.
  retryable?: boolean;
};

export type MutationResult<TData, TVariables> = UseMutationResult<TData, Error, TVariables>;
