import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { DELETE } from '../../services/session/constants';
import { UNSORTED_BUCKET_ID } from '../../services/shoppingList/constants';
import { useApiMutation } from '../useApiMutation';
import { useListCache } from '../useListCache';
import { useListParams } from '../useListParams';
import type { MutationResult } from '../useMutation/types';

export const useDeleteBucketMutation = (): MutationResult<ApiResult<undefined, never>, string> => {
  const { paramsFor } = useListParams();
  const { updateBuckets, updateItems } = useListCache();
  return useApiMutation({
    name: MutationName.deleteBucket,
    service: WebService.listBucket,
    method: DELETE,
    toBody: () => undefined,
    toParams: (id: string) => paramsFor({ bucketId: id }),
    reasons: [],
    onSuccess: (_removed, id) => {
      updateBuckets({ update: (buckets) => buckets.filter((bucket) => bucket.id !== id) });
      updateItems({
        update: (items) =>
          items.map((item) =>
            item.bucketId === id ? { ...item, bucketId: UNSORTED_BUCKET_ID } : item,
          ),
      });
    },
  });
};
