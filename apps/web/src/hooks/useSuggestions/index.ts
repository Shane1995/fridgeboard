import type { IHistoryResponse } from '@fridgeboard/contract/lists';
import { useMemo } from 'react';
import { WebService } from '../../services/configuration/schema/constants';
import type { HistoryEntry } from '../../services/shoppingList/types';
import { suggestFrom } from '../../services/shoppingList/utils/suggestFrom';
import { useApiQuery } from '../useApiQuery';
import { useInvalidateOnChange } from '../useInvalidateOnChange';
import { useListParams } from '../useListParams';
import {
  SUGGESTIONS_CHANGE_KEYS,
  SUGGESTIONS_CHANGE_TYPES,
  SUGGESTIONS_QUERY_KEY,
} from './constants';
import type { UseSuggestionsOptions } from './types';

export const useSuggestions = ({ query, onList }: UseSuggestionsOptions): HistoryEntry[] => {
  const { householdId, paramsFor } = useListParams();
  useInvalidateOnChange({ types: SUGGESTIONS_CHANGE_TYPES, keys: SUGGESTIONS_CHANGE_KEYS });
  const { data: history } = useApiQuery({
    name: SUGGESTIONS_QUERY_KEY,
    service: WebService.listHistory,
    params: householdId === undefined ? {} : paramsFor(),
    enabled: householdId !== undefined && query.trim() !== '',
    select: ({ entries }: IHistoryResponse) => entries,
  });
  const names = onList.join('\n');
  return useMemo(
    () =>
      suggestFrom({
        history: history ?? [],
        query,
        onList: names === '' ? [] : names.split('\n'),
      }),
    [history, query, names],
  );
};
