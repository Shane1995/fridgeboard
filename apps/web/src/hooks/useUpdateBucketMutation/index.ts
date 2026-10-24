import type { IBucket } from '@fridgeboard/contract/lists';
import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { PATCH } from '../../services/session/constants';
import type { BucketChanges } from '../../services/shoppingList/types';
import { useApiMutation } from '../useApiMutation';
import { useListCache } from '../useListCache';
import { useListParams } from '../useListParams';
import type { MutationResult } from '../useMutation/types';

type Variables = { id: string; changes: BucketChanges };

export const useUpdateBucketMutation = (): MutationResult<ApiResult<IBucket, never>, Variables> => {
  const { paramsFor } = useListParams();
  const { updateBuckets } = useListCache();
  return useApiMutation({
    name: MutationName.updateBucket,
    service: WebService.listBucket,
    method: PATCH,
    toBody: ({ changes }: Variables) => changes,
    toParams: ({ id }) => paramsFor({ bucketId: id }),
    reasons: [],
    onSuccess: (saved) =>
      updateBuckets({
        update: (buckets) => buckets.map((bucket) => (bucket.id === saved.id ? saved : bucket)),
      }),
  });
};
