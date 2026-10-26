import type { IListItemsResponse } from '@fridgeboard/contract/lists';
import { WebService } from '../../services/configuration/schema/constants';
import type { ListItem } from '../../services/shoppingList/types';
import { toListItem } from '../../services/shoppingList/utils/toListItem';
import { useApiQuery } from '../useApiQuery';
import { useInvalidateOnChange } from '../useInvalidateOnChange';
import { useListParams } from '../useListParams';
import type { QueryResult } from '../useQuery/types';
import { ITEMS_CHANGE_KEYS, ITEMS_CHANGE_TYPES, ITEMS_QUERY_KEY } from './constants';

export const useItemsQuery = (): QueryResult<ListItem[]> => {
  const { householdId, paramsFor } = useListParams();
  useInvalidateOnChange({ types: ITEMS_CHANGE_TYPES, keys: ITEMS_CHANGE_KEYS });
  return useApiQuery({
    name: ITEMS_QUERY_KEY,
    service: WebService.listItems,
    params: householdId === undefined ? {} : paramsFor(),
    enabled: householdId !== undefined,
    select: ({ items }: IListItemsResponse) => items.map(toListItem),
  });
};
