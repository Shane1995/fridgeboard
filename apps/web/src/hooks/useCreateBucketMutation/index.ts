import { MutationName } from '../../services/configuration/schema/constants';
import type { Bucket, NewBucket } from '../../services/shoppingList/types';
import { BUCKETS_QUERY_KEY } from '../useBucketsQuery/constants';
import type { MutationResult } from '../useMutation/types';
import { useShoppingListMutation } from '../useShoppingListMutation';

export const useCreateBucketMutation = (): MutationResult<Bucket, NewBucket> =>
  useShoppingListMutation({
    name: MutationName.createBucket,
    write: ({ repository, variables }) => repository.createBucket(variables),
    invalidates: [BUCKETS_QUERY_KEY],
  });
