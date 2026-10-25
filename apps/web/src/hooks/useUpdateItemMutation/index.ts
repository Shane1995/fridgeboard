import type { IListItem, IListItemsResponse } from '@fridgeboard/contract/lists';
import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { PATCH } from '../../services/session/constants';
import type { ItemChanges } from '../../services/shoppingList/types';
import { ITEM_FAILURE_COPY } from '../../services/shoppingList/constants';
import { useApiMutation } from '../useApiMutation';
import { useInvalidateQueries } from '../useInvalidateQueries';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import { useListCache } from '../useListCache';
import { useListParams } from '../useListParams';
import type { MutationResult } from '../useMutation/types';
import { SUGGESTIONS_QUERY_KEY } from '../useSuggestions/constants';

type Variables = { id: string; changes: ItemChanges };

export const useUpdateItemMutation = (): MutationResult<ApiResult<IListItem, never>, Variables> => {
  const { paramsFor, queryKeyFor } = useListParams();
  const invalidate = useInvalidateQueries();
  const { updateItems } = useListCache();
  return useApiMutation({
    name: MutationName.updateItem,
    service: WebService.listItem,
    method: PATCH,
    toBody: ({ changes }: Variables) => changes,
    toParams: ({ id }) => paramsFor({ itemId: id }),
    reasons: [],
    failureMessage: ITEM_FAILURE_COPY.update,
    onSuccess: (saved) => {
      updateItems({
        update: (items) => items.map((item) => (item.id === saved.id ? saved : item)),
      });
      void invalidate({ keys: [SUGGESTIONS_QUERY_KEY], refetchType: 'none' });
    },
    optimistic: {
      queryKey: queryKeyFor(ITEMS_QUERY_KEY),
      update: ({
        current,
        variables: { id, changes },
      }: {
        current: IListItemsResponse;
        variables: Variables;
      }) => ({
        items: current.items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
      }),
    },
  });
};
