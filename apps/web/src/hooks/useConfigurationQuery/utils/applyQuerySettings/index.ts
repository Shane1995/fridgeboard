import {
  CONFIGURABLE_MUTATION_NAMES,
  NON_RETRYABLE_MUTATION_NAMES,
} from '@fridgeboard/contract/configuration/mutations/constants';
import { QUERY_NAMES } from '@fridgeboard/contract/configuration/queries/constants';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import type { QueryClient } from '@tanstack/react-query';
import { toMutationOptions } from '../toMutationOptions';
import { toQueryOptions } from '../toQueryOptions';

export const applyQuerySettings = (
  queryClient: QueryClient,
  { queries, mutations }: Pick<WebConfiguration, 'queries' | 'mutations'>,
): void => {
  const { default: defaultQuery, ...namedQueries } = queries;
  const { default: defaultMutation, ...namedMutations } = mutations;

  queryClient.setDefaultOptions({
    queries: toQueryOptions(defaultQuery),
    mutations: toMutationOptions(defaultMutation),
  });

  QUERY_NAMES.forEach((name) => {
    queryClient.setQueryDefaults([name], {});
  });
  CONFIGURABLE_MUTATION_NAMES.forEach((name) => {
    queryClient.setMutationDefaults([name], {});
  });
  NON_RETRYABLE_MUTATION_NAMES.forEach((name) => {
    queryClient.setMutationDefaults([name], { retry: 0 });
  });
  Object.entries(namedQueries).forEach(([name, entry]) => {
    queryClient.setQueryDefaults([name], toQueryOptions(entry ?? {}));
  });
  Object.entries(namedMutations).forEach(([name, entry]) => {
    queryClient.setMutationDefaults([name], toMutationOptions(entry ?? {}));
  });
};
