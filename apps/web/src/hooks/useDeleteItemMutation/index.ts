import { MutationName } from '../../services/configuration/schema/constants';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import type { MutationResult } from '../useMutation/types';
import { useShoppingListMutation } from '../useShoppingListMutation';

export const useDeleteItemMutation = (): MutationResult<void, string> =>
  useShoppingListMutation(
    MutationName.deleteItem,
    (repository, variables) => repository.deleteItem(variables),
    [ITEMS_QUERY_KEY],
  );
