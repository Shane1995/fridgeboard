import { MutationName } from '../../services/configuration/schema/constants';
import type { Bucket, BucketChanges } from '../../services/shoppingList/types';
import { BUCKETS_QUERY_KEY } from '../useBucketsQuery/constants';
import type { MutationResult } from '../useMutation/types';
import { useShoppingListMutation } from '../useShoppingListMutation';

export const useUpdateBucketMutation = (): MutationResult<
  Bucket,
  { id: string; changes: BucketChanges }
> =>
  useShoppingListMutation(
    MutationName.updateBucket,
    (repository, { id, changes }) => repository.updateBucket(id, changes),
    [BUCKETS_QUERY_KEY],
  );
