import type { IListItemsResponse } from '@fridgeboard/contract/lists';
import { WebService } from '../../services/configuration/schema/constants';
import type { ListItem } from '../../services/shoppingList/types';
import { toListItem } from '../../services/shoppingList/utils/toListItem';
import { useApiQuery } from '../useApiQuery';
import { useListParams } from '../useListParams';
import type { QueryResult } from '../useQuery/types';
import { ITEMS_QUERY_KEY } from './constants';

export const useItemsQuery = (): QueryResult<ListItem[]> => {
  const { householdId, paramsFor } = useListParams();
  return useApiQuery({
    name: ITEMS_QUERY_KEY,
    service: WebService.listItems,
    params: householdId === undefined ? {} : paramsFor(),
    enabled: householdId !== undefined,
    select: ({ items }: IListItemsResponse) => items.map(toListItem),
  });
};
