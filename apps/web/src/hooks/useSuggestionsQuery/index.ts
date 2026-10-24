import type { HistoryEntry } from '../../services/shoppingList/types';
import { requireRepository, useShoppingList } from '../useShoppingList';
import { useQuery } from '../useQuery';
import type { QueryResult } from '../useQuery/types';
import { SUGGESTIONS_QUERY_KEY } from './constants';

export const useSuggestionsQuery = (
  query: string,
  onList: readonly string[],
): QueryResult<HistoryEntry[]> => {
  const { householdId, repository } = useShoppingList();
  return useQuery({
    queryKey: [SUGGESTIONS_QUERY_KEY, householdId, query, onList],
    queryFn: () => requireRepository(repository).suggest(query, onList),
    enabled: repository !== undefined && query !== '',
  });
};
