import { useMemo } from 'react';
import type { HistoryEntry } from '../../services/shoppingList/types';
import { suggestFrom } from '../../services/shoppingList/utils/suggestFrom';
import { useQuery } from '../useQuery';
import { requireRepository, useShoppingList } from '../useShoppingList';
import { SUGGESTIONS_QUERY_KEY } from './constants';
import type { UseSuggestionsOptions } from './types';

export const useSuggestions = ({ query, onList }: UseSuggestionsOptions): HistoryEntry[] => {
  const { householdId, repository } = useShoppingList();
  const { data: history } = useQuery({
    queryKey: [SUGGESTIONS_QUERY_KEY, householdId],
    queryFn: () => requireRepository(repository).history(),
    enabled: repository !== undefined && query.trim() !== '',
  });
  const names = onList.join('\n');
  return useMemo(
    () =>
      suggestFrom({ history: history ?? [], query, onList: names === '' ? [] : names.split('\n') }),
    [history, query, names],
  );
};
