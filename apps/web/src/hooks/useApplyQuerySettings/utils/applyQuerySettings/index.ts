import {
  CONFIGURABLE_MUTATION_NAMES,
  NON_RETRYABLE_MUTATION_NAMES,
} from '@fridgeboard/contract/configuration/mutations/constants';
import type { MutationEntry } from '@fridgeboard/contract/configuration/mutations/types';
import { QUERY_NAMES } from '@fridgeboard/contract/configuration/queries/constants';
import type { QueryEntry } from '@fridgeboard/contract/configuration/queries/types';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import type { DefaultOptions, QueryClient } from '@tanstack/react-query';
import { toMutationOptions } from '../toMutationOptions';
import { toQueryOptions } from '../toQueryOptions';

export const applyQuerySettings = (
  queryClient: QueryClient,
  { queries, mutations }: Pick<WebConfiguration, 'queries' | 'mutations'>,
  baseline: DefaultOptions,
): void => {
  const { default: defaultQuery, ...namedQueries } = queries;
  const { default: defaultMutation, ...namedMutations } = mutations;

  queryClient.setDefaultOptions({
    ...baseline,
    queries: { ...baseline.queries, ...(defaultQuery ? toQueryOptions(defaultQuery) : {}) },
    mutations: {
      ...baseline.mutations,
      ...(defaultMutation ? toMutationOptions(defaultMutation) : {}),
    },
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
  Object.entries(namedQueries).forEach(([name, entry]: [string, QueryEntry]) => {
    queryClient.setQueryDefaults([name], toQueryOptions(entry));
  });
  Object.entries(namedMutations).forEach(([name, entry]: [string, MutationEntry]) => {
    queryClient.setMutationDefaults([name], toMutationOptions(entry));
  });
};
