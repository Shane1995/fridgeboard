import type { IListItemsResponse } from '@fridgeboard/contract/lists';
import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { DELETE } from '../../services/session/constants';
import { ClearItemsBy, ITEM_FAILURE_COPY } from '../../services/shoppingList/constants';
import { useApiMutation } from '../useApiMutation';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import { useListParams } from '../useListParams';
import type { MutationResult } from '../useMutation/types';

// One request clears the whole list or only the ticked items. The list is emptied at once and put
// back if the request fails.
export const useClearItemsMutation = (): MutationResult<
  ApiResult<undefined, 'too-many-items'>,
  ClearItemsBy
> => {
  const { paramsFor, queryKeyFor } = useListParams();
  return useApiMutation({
    name: MutationName.clearItems,
    service: WebService.clearItems,
    method: DELETE,
    toBody: () => undefined,
    toParams: () => paramsFor(),
    toQuery: (by: ClearItemsBy) => ({ clearby: by }),
    reasons: ['too-many-items'],
    failureMessage: (by: ClearItemsBy) =>
      by === ClearItemsBy.All ? ITEM_FAILURE_COPY.clearAll : ITEM_FAILURE_COPY.clearTicked,
    optimistic: {
      queryKey: queryKeyFor(ITEMS_QUERY_KEY),
      update: ({
        current,
        variables,
      }: {
        current: IListItemsResponse;
        variables: ClearItemsBy;
      }) => ({
        items:
          variables === ClearItemsBy.All ? [] : current.items.filter(({ checked }) => !checked),
      }),
    },
  });
};
