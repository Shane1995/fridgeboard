import type { IShopsResponse } from '@fridgeboard/contract/lists';
import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { PUT } from '../../services/session/constants';
import { useApiMutation } from '../useApiMutation';
import { useListCache } from '../useListCache';
import { useListParams } from '../useListParams';
import type { MutationResult } from '../useMutation/types';

export const useReorderShopsMutation = (): MutationResult<
  ApiResult<IShopsResponse, never>,
  readonly string[]
> => {
  const { paramsFor } = useListParams();
  const { updateShops } = useListCache();
  return useApiMutation({
    name: MutationName.reorderShops,
    service: WebService.listShopsOrder,
    method: PUT,
    toBody: (ids: readonly string[]) => ({ ids }),
    toParams: () => paramsFor(),
    reasons: [],
    onSuccess: ({ shops }) => updateShops({ update: () => shops }),
  });
};
