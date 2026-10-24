import { MutationName } from '../../services/configuration/schema/constants';
import { BUCKETS_QUERY_KEY } from '../useBucketsQuery/constants';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import type { MutationResult } from '../useMutation/types';
import { useShoppingListMutation } from '../useShoppingListMutation';

export const useDeleteBucketMutation = (): MutationResult<void, string> =>
  useShoppingListMutation(
    MutationName.deleteBucket,
    (repository, variables) => repository.deleteBucket(variables),
    [BUCKETS_QUERY_KEY, ITEMS_QUERY_KEY],
  );
