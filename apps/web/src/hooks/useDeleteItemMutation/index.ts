import { MutationName } from '../../services/configuration/schema/constants';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import type { MutationResult } from '../useMutation/types';
import { useShoppingListMutation } from '../useShoppingListMutation';

export const useDeleteItemMutation = (): MutationResult<void, string> =>
  useShoppingListMutation({
    name: MutationName.deleteItem,
    write: ({ repository, variables }) => repository.deleteItem({ id: variables }),
    invalidates: [ITEMS_QUERY_KEY],
    optimistic: ({ items, variables }) => items.filter(({ id }) => id !== variables),
  });
