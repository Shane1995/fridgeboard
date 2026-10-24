import type { IBucketsResponse, IListItemsResponse } from '@fridgeboard/contract/lists';
import { useQueryClient } from '@tanstack/react-query';
import { BUCKETS_QUERY_KEY } from '../useBucketsQuery/constants';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import { useListParams } from '../useListParams';
import type { UpdateBucketsOptions, UpdateItemsOptions } from './types';

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
    updateBuckets: ({ update }: UpdateBucketsOptions) =>
      queryClient.setQueryData<IBucketsResponse>(queryKeyFor(BUCKETS_QUERY_KEY), (current) =>
        current === undefined ? current : { buckets: update(current.buckets) },
      ),
  };
};
