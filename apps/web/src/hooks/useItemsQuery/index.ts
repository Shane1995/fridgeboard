import type { ListItem } from '../../services/shoppingList/types';
import { requireRepository, useShoppingList } from '../useShoppingList';
import { useQuery } from '../useQuery';
import type { QueryResult } from '../useQuery/types';
import { ITEMS_QUERY_KEY } from './constants';

export const useItemsQuery = (): QueryResult<ListItem[]> => {
  const { householdId, repository } = useShoppingList();
  return useQuery({
    queryKey: [ITEMS_QUERY_KEY, householdId],
    queryFn: () => requireRepository(repository).listItems(),
    enabled: repository !== undefined,
  });
};
