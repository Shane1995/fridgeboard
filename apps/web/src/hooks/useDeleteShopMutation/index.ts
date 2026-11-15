import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { DELETE } from '../../services/session/constants';
import { SHOP_FAILURE_COPY, SHOP_SUCCESS_COPY } from '../../services/shoppingList/constants';
import { useApiMutation } from '../useApiMutation';
import { useListCache } from '../useListCache';
import { useListParams } from '../useListParams';
import type { MutationResult } from '../useMutation/types';

export const useDeleteShopMutation = (): MutationResult<ApiResult<undefined, never>, string> => {
  const { paramsFor } = useListParams();
  const { updateShops, updateItems } = useListCache();
  return useApiMutation({
    name: MutationName.deleteShop,
    service: WebService.listShop,
    method: DELETE,
    toBody: () => undefined,
    toParams: (id: string) => paramsFor({ shopId: id }),
    reasons: [],
    failureMessage: SHOP_FAILURE_COPY.remove,
    successMessage: SHOP_SUCCESS_COPY.remove,
    onSuccess: (_removed, id) => {
      updateShops({ update: (shops) => shops.filter((shop) => shop.id !== id) });
      updateItems({
        update: (items) =>
          items.map((item) =>
            item.shops.some((shop) => shop.id === id)
              ? { ...item, shops: item.shops.filter((shop) => shop.id !== id) }
              : item,
          ),
      });
    },
  });
};
