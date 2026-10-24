import type { IShop } from '@fridgeboard/contract/lists';
import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { PATCH } from '../../services/session/constants';
import type { ShopChanges } from '../../services/shoppingList/types';
import { useApiMutation } from '../useApiMutation';
import { useListCache } from '../useListCache';
import { useListParams } from '../useListParams';
import type { MutationResult } from '../useMutation/types';

type Variables = { id: string; changes: ShopChanges };

export const useUpdateShopMutation = (): MutationResult<ApiResult<IShop, never>, Variables> => {
  const { paramsFor } = useListParams();
  const { updateShops } = useListCache();
  return useApiMutation({
    name: MutationName.updateShop,
    service: WebService.listShop,
    method: PATCH,
    toBody: ({ changes }: Variables) => changes,
    toParams: ({ id }) => paramsFor({ shopId: id }),
    reasons: [],
    onSuccess: (saved) =>
      updateShops({
        update: (shops) => shops.map((shop) => (shop.id === saved.id ? saved : shop)),
      }),
  });
};
