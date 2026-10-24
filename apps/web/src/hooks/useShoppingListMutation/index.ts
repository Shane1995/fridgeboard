import { useQueryClient } from '@tanstack/react-query';
import type { ListItem } from '../../services/shoppingList/types';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { requireRepository, useShoppingList } from '../useShoppingList';
import type { ShoppingListMutationOptions } from './types';

export const useShoppingListMutation = <TData, TVariables = void>({
  name,
  write,
  invalidates,
  optimistic,
}: ShoppingListMutationOptions<TData, TVariables>): MutationResult<TData, TVariables> => {
  const queryClient = useQueryClient();
  const { householdId, repository } = useShoppingList();
  return useMutation({
    mutationKey: [name],
    mutationFn: async (variables: TVariables) => {
      const itemsKey = [ITEMS_QUERY_KEY, householdId];
      await queryClient.cancelQueries({ queryKey: itemsKey });
      const snapshot =
        optimistic === undefined ? undefined : queryClient.getQueryData<ListItem[]>(itemsKey);
      if (optimistic !== undefined && snapshot !== undefined) {
        queryClient.setQueryData(itemsKey, optimistic({ items: snapshot, variables }));
      }
      const data = await write({ repository: requireRepository(repository), variables }).catch(
        (error: unknown) => {
          if (snapshot !== undefined) {
            queryClient.setQueryData(itemsKey, snapshot);
          }
          throw error;
        },
      );
      await Promise.all(
        invalidates.map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
      );
      return data;
    },
  });
};
