import type { IBucket } from '@fridgeboard/contract/lists';
import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { POST } from '../../services/session/constants';
import type { NewBucket } from '../../services/shoppingList/types';
import { useApiMutation } from '../useApiMutation';
import { useListCache } from '../useListCache';
import { useListParams } from '../useListParams';
import type { MutationResult } from '../useMutation/types';

export const useCreateBucketMutation = (): MutationResult<ApiResult<IBucket, never>, NewBucket> => {
  const { paramsFor } = useListParams();
  const { updateBuckets } = useListCache();
  return useApiMutation({
    name: MutationName.createBucket,
    service: WebService.listBuckets,
    method: POST,
    toBody: ({ name, color }: NewBucket) => ({ name, color }),
    toParams: () => paramsFor(),
    reasons: [],
    onSuccess: (created) => updateBuckets({ update: (buckets) => [...buckets, created] }),
  });
};
