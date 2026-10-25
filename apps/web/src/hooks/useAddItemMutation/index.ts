import type { IListItem } from '@fridgeboard/contract/lists';
import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { POST } from '../../services/session/constants';
import type { NewItem } from '../../services/shoppingList/types';
import { ITEM_FAILURE_COPY } from '../../services/shoppingList/constants';
import { useApiMutation } from '../useApiMutation';
import { useInvalidateQueries } from '../useInvalidateQueries';
import { useListCache } from '../useListCache';
import { useListParams } from '../useListParams';
import type { MutationResult } from '../useMutation/types';
import { SUGGESTIONS_QUERY_KEY } from '../useSuggestions/constants';

export const useAddItemMutation = (): MutationResult<ApiResult<IListItem, never>, NewItem> => {
  const { paramsFor } = useListParams();
  const invalidate = useInvalidateQueries();
  const { updateItems } = useListCache();
  return useApiMutation({
    name: MutationName.addItem,
    service: WebService.listItems,
    method: POST,
    toBody: ({ name, shopIds }: NewItem) => ({ name, shopIds }),
    toParams: () => paramsFor(),
    reasons: [],
    failureMessage: ITEM_FAILURE_COPY.add,
    onSuccess: (added) => {
      updateItems({ update: (items) => [...items, added] });
      void invalidate({ keys: [SUGGESTIONS_QUERY_KEY], refetchType: 'none' });
    },
  });
};
