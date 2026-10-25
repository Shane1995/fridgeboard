import type { IListItemsResponse } from '@fridgeboard/contract/lists';
import { useQueryClient } from '@tanstack/react-query';
import { sendJson } from '../../services/api/sendJson';
import { resolveEndpoint } from '../../services/configuration/resolveEndpoint';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { DELETE } from '../../services/session/constants';
import { ITEM_FAILURE_COPY } from '../../services/shoppingList/constants';
import { mergedEntry } from '../../utils/mergedEntry';
import { useInvalidateQueries } from '../useInvalidateQueries';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import { useListParams } from '../useListParams';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { useSessionContext } from '../useSessionContext';
import { useToast } from '../useToast';

export const useClearCheckedMutation = (): MutationResult<void, void> => {
  const queryClient = useQueryClient();
  const { services, mutations } = useRemoteConfigContext();
  const { apiFetch } = useSessionContext();
  const { paramsFor, queryKeyFor } = useListParams();
  const invalidate = useInvalidateQueries();
  const toast = useToast();
  return useMutation({
    mutationKey: [MutationName.clearChecked],
    mutationFn: async () => {
      const itemsKey = queryKeyFor(ITEMS_QUERY_KEY);
      const base = paramsFor();
      await queryClient.cancelQueries({ queryKey: itemsKey });
      const snapshot = queryClient.getQueryData<IListItemsResponse>(itemsKey);
      const ticked = (snapshot?.items ?? []).filter(({ checked }) => checked);
      if (snapshot !== undefined) {
        queryClient.setQueryData(itemsKey, {
          items: snapshot.items.filter(({ checked }) => !checked),
        });
      }
      const results = await Promise.all(
        ticked.map(({ id }) =>
          sendJson<undefined, never>(
            resolveEndpoint({
              api: services.api,
              service: WebService.listItem,
              timeoutMs: mergedEntry(mutations, MutationName.clearChecked).timeoutMs,
              params: { ...base, itemId: id },
            }),
            DELETE,
            undefined,
            [],
            apiFetch,
          ),
        ),
      ).catch((error: unknown) => {
        queryClient.setQueryData(itemsKey, snapshot);
        toast.error(ITEM_FAILURE_COPY.clearTicked);
        throw error;
      });
      if (results.some(({ ok }) => !ok)) {
        await invalidate({ keys: [ITEMS_QUERY_KEY] });
        toast.error(ITEM_FAILURE_COPY.clearTicked);
        throw new Error('Clearing the ticked items failed');
      }
    },
  });
};
