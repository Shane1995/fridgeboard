import { useMutation as useTanStackMutation } from '@tanstack/react-query';
import type { MutationOptions, MutationResult } from './types';

export const useMutation = <TData, TVariables = void>({
  mutationFn,
}: MutationOptions<TData, TVariables>): MutationResult<TData, TVariables> =>
  useTanStackMutation({ mutationFn });
