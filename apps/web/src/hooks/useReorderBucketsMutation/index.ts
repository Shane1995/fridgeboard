import { MutationName } from '../../services/configuration/schema/constants';
import type { Bucket } from '../../services/shoppingList/types';
import { BUCKETS_QUERY_KEY } from '../useBucketsQuery/constants';
import type { MutationResult } from '../useMutation/types';
import { useShoppingListMutation } from '../useShoppingListMutation';

export const useReorderBucketsMutation = (): MutationResult<Bucket[], readonly string[]> =>
  useShoppingListMutation(
    MutationName.reorderBuckets,
    (repository, variables) => repository.reorderBuckets(variables),
    [BUCKETS_QUERY_KEY],
  );
