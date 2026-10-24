import { MAIN_LIST_ID } from '@fridgeboard/contract/lists/constants';
import { useMemo } from 'react';
import { createApiShoppingListRepository } from '../../services/shoppingList/apiRepository';
import type { ShoppingListRepository } from '../../services/shoppingList/types';
import { useActiveHousehold } from '../useActiveHousehold';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { useSessionContext } from '../useSessionContext';
import type { ShoppingList } from './types';

export const useShoppingList = (): ShoppingList => {
  const householdId = useActiveHousehold()?.id;
  const { services, queries, mutations } = useRemoteConfigContext();
  const { apiFetch } = useSessionContext();
  const api = services.api;
  const readTimeoutMs = queries.default.timeoutMs;
  const writeTimeoutMs = mutations.default.timeoutMs;

  const repository = useMemo(
    () =>
      householdId === undefined
        ? undefined
        : createApiShoppingListRepository({
            householdId,
            listId: MAIN_LIST_ID,
            api,
            readTimeoutMs,
            writeTimeoutMs,
            fetcher: apiFetch,
          }),
    [householdId, api, readTimeoutMs, writeTimeoutMs, apiFetch],
  );

  return { householdId, repository };
};

export const requireRepository = (repository: ShoppingListRepository | undefined) => {
  if (repository === undefined) {
    throw new Error('No active household');
  }
  return repository;
};
