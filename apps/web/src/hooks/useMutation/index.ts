import { useMutation as useTanStackMutation } from '@tanstack/react-query';
import { mergedEntry } from '../../utils/mergedEntry';
import { toMutationOptions } from '../../utils/toMutationOptions';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import type { MutationOptions, MutationResult } from './types';

// Retry settings come from the remote configuration, but only for mutations marked `retryable`.
// A mutation such as creating a household must never run twice, whatever the configuration says.
export const useMutation = <TData, TVariables = void>({
  mutationFn,
  mutationKey,
  retryable = false,
}: MutationOptions<TData, TVariables>): MutationResult<TData, TVariables> => {
  const { mutations } = useRemoteConfigContext();
  return useTanStackMutation({
    mutationFn,
    mutationKey,
    ...(retryable ? toMutationOptions(mergedEntry(mutations, mutationKey[0])) : { retry: 0 }),
  });
};
