import type { IShopsResponse } from '@fridgeboard/contract/lists';
import { WebService } from '../../services/configuration/schema/constants';
import type { Shop } from '../../services/shoppingList/types';
import { toShop } from '../../services/shoppingList/utils/toShop';
import { useApiQuery } from '../useApiQuery';
import { useListParams } from '../useListParams';
import type { QueryResult } from '../useQuery/types';
import { SHOPS_QUERY_KEY } from './constants';

export const useShopsQuery = (): QueryResult<Shop[]> => {
  const { householdId, paramsFor } = useListParams();
  return useApiQuery({
    name: SHOPS_QUERY_KEY,
    service: WebService.listShops,
    params: householdId === undefined ? {} : paramsFor(),
    enabled: householdId !== undefined,
    select: ({ shops }: IShopsResponse) => shops.map(toShop),
  });
};
