import type { IListItemsResponse } from '@fridgeboard/contract/lists';
import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { DELETE } from '../../services/session/constants';
import { ITEM_FAILURE_COPY } from '../../services/shoppingList/constants';
import { useApiMutation } from '../useApiMutation';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import { useListParams } from '../useListParams';
import type { MutationResult } from '../useMutation/types';

export const useDeleteItemMutation = (): MutationResult<ApiResult<undefined, never>, string> => {
  const { paramsFor, queryKeyFor } = useListParams();
  return useApiMutation({
    name: MutationName.deleteItem,
    service: WebService.listItem,
    method: DELETE,
    toBody: () => undefined,
    toParams: (id: string) => paramsFor({ itemId: id }),
    reasons: [],
    failureMessage: ITEM_FAILURE_COPY.remove,
    onSuccess: () => undefined,
    optimistic: {
      queryKey: queryKeyFor(ITEMS_QUERY_KEY),
      update: ({ current, variables }: { current: IListItemsResponse; variables: string }) => ({
        items: current.items.filter(({ id }) => id !== variables),
      }),
    },
  });
};
