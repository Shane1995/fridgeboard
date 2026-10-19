import type { MutationEntry } from '@fridgeboard/contract/configuration/mutations/types';
import type { QueryEntry } from '@fridgeboard/contract/configuration/queries/types';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import type { QueryClient } from '@tanstack/react-query';
import { NON_RETRYABLE_MUTATION_NAMES } from '@fridgeboard/contract/configuration/mutations/constants';
import { toMutationOptions } from '../toMutationOptions';
import { toQueryOptions } from '../toQueryOptions';

export const applyQuerySettings = (
  queryClient: QueryClient,
  { queries, mutations }: Pick<WebConfiguration, 'queries' | 'mutations'>,
): void => {
  const { default: defaultQuery, ...namedQueries } = queries;
  const { default: defaultMutation, ...namedMutations } = mutations;
  const current = queryClient.getDefaultOptions();

  if (defaultQuery || defaultMutation) {
    queryClient.setDefaultOptions({
      ...current,
      ...(defaultQuery ? { queries: { ...current.queries, ...toQueryOptions(defaultQuery) } } : {}),
      ...(defaultMutation
        ? { mutations: { ...current.mutations, ...toMutationOptions(defaultMutation) } }
        : {}),
    });
  }

  NON_RETRYABLE_MUTATION_NAMES.forEach((name) => {
    queryClient.setMutationDefaults([name], { retry: 0 });
  });
  Object.entries(namedQueries).forEach(([name, entry]: [string, QueryEntry]) => {
    queryClient.setQueryDefaults([name], toQueryOptions(entry));
  });
  Object.entries(namedMutations).forEach(([name, entry]: [string, MutationEntry]) => {
    queryClient.setMutationDefaults([name], toMutationOptions(entry));
  });
};
