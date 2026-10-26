import { useRef } from 'react';
import type { IListItem } from '@fridgeboard/contract/lists';
import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { POST } from '../../services/session/constants';
import type { NewItem } from '../../services/shoppingList/types';
import { ITEM_FAILURE_COPY, PENDING_ITEM_PREFIX } from '../../services/shoppingList/constants';
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
  const pendingIds = useRef(new WeakMap<NewItem, string>());
  const counter = useRef(0);

  const dropPending = (variables: NewItem) => {
    const pendingId = pendingIds.current.get(variables);
    if (pendingId !== undefined) {
      updateItems({ update: (items) => items.filter(({ id }) => id !== pendingId) });
    }
  };

  return useApiMutation({
    name: MutationName.addItem,
    service: WebService.listItems,
    method: POST,
    toBody: ({ name, shopIds }: NewItem) => ({ name, shopIds }),
    toParams: () => paramsFor(),
    reasons: [],
    failureMessage: ({ name }: NewItem) => ITEM_FAILURE_COPY.add(name),
    onStart: (variables) => {
      counter.current += 1;
      const pendingId = `${PENDING_ITEM_PREFIX}${counter.current}`;
      pendingIds.current.set(variables, pendingId);
      updateItems({
        update: (items) => [
          ...items,
          {
            id: pendingId,
            name: variables.name,
            shopIds: variables.shopIds,
            checked: false,
            createdAt: Date.now(),
            addedBy: '',
          },
        ],
      });
    },
    onFailure: dropPending,
    onSuccess: (added, variables) => {
      const pendingId = pendingIds.current.get(variables);
      updateItems({
        update: (items) =>
          items.some(({ id }) => id === pendingId)
            ? items.map((item) => (item.id === pendingId ? added : item))
            : [...items, added],
      });
      void invalidate({ keys: [SUGGESTIONS_QUERY_KEY], refetchType: 'none' });
    },
  });
};
