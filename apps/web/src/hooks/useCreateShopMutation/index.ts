import type { IShop } from '@fridgeboard/contract/lists';
import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { POST } from '../../services/session/constants';
import type { NewShop } from '../../services/shoppingList/types';
import { useApiMutation } from '../useApiMutation';
import { useListCache } from '../useListCache';
import { useListParams } from '../useListParams';
import type { MutationResult } from '../useMutation/types';

export const useCreateShopMutation = (): MutationResult<ApiResult<IShop, never>, NewShop> => {
  const { paramsFor } = useListParams();
  const { updateShops } = useListCache();
  return useApiMutation({
    name: MutationName.createShop,
    service: WebService.listShops,
    method: POST,
    toBody: ({ name, color }: NewShop) => ({ name, color }),
    toParams: () => paramsFor(),
    reasons: [],
    onSuccess: (created) => updateShops({ update: (shops) => [...shops, created] }),
  });
};
