import type { IBucketsResponse } from '@fridgeboard/contract/lists';
import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { PUT } from '../../services/session/constants';
import { useApiMutation } from '../useApiMutation';
import { useListCache } from '../useListCache';
import { useListParams } from '../useListParams';
import type { MutationResult } from '../useMutation/types';

export const useReorderBucketsMutation = (): MutationResult<
  ApiResult<IBucketsResponse, never>,
  readonly string[]
> => {
  const { paramsFor } = useListParams();
  const { updateBuckets } = useListCache();
  return useApiMutation({
    name: MutationName.reorderBuckets,
    service: WebService.listBucketsOrder,
    method: PUT,
    toBody: (ids: readonly string[]) => ({ ids }),
    toParams: () => paramsFor(),
    reasons: [],
    onSuccess: ({ buckets }) => updateBuckets({ update: () => buckets }),
  });
};
