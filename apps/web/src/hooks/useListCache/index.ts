import type { IShopsResponse, IListItemsResponse } from '@fridgeboard/contract/lists';
import { useQueryClient } from '@tanstack/react-query';
import { SHOPS_QUERY_KEY } from '../useShopsQuery/constants';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import { useListParams } from '../useListParams';
import type { UpdateShopsOptions, UpdateItemsOptions } from './types';

// What the API answers is written into the cached list, so a change does not need a second
// request to see it. Nothing happens when that list was never loaded.
export const useListCache = () => {
  const queryClient = useQueryClient();
  const { queryKeyFor } = useListParams();
  return {
    updateItems: ({ update }: UpdateItemsOptions) =>
      queryClient.setQueryData<IListItemsResponse>(queryKeyFor(ITEMS_QUERY_KEY), (current) =>
        current === undefined ? current : { items: update(current.items) },
      ),
    updateShops: ({ update }: UpdateShopsOptions) =>
      queryClient.setQueryData<IShopsResponse>(queryKeyFor(SHOPS_QUERY_KEY), (current) =>
        current === undefined ? current : { shops: update(current.shops) },
      ),
  };
};
