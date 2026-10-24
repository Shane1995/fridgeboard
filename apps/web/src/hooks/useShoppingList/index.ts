import { useMemo } from 'react';
import { shoppingListRepositoryFor } from '../../services/shoppingList/repository';
import type { ShoppingListRepository } from '../../services/shoppingList/types';
import { seedDemoList } from '../../services/shoppingList/utils/seedDemoList';
import { useActiveHousehold } from '../useActiveHousehold';
import type { ShoppingList } from './types';

export const useShoppingList = (): ShoppingList => {
  const householdId = useActiveHousehold();
  const repository = useMemo(() => {
    if (householdId === undefined) {
      return undefined;
    }
    if (import.meta.env.MODE === 'development') {
      seedDemoList(householdId);
    }
    return shoppingListRepositoryFor(householdId);
  }, [householdId]);
  return { householdId, repository };
};

export const requireRepository = (repository: ShoppingListRepository | undefined) => {
  if (repository === undefined) {
    throw new Error('No active household');
  }
  return repository;
};
