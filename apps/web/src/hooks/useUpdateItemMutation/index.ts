import { MutationName } from '../../services/configuration/schema/constants';
import type { ItemChanges, ListItem } from '../../services/shoppingList/types';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import type { MutationResult } from '../useMutation/types';
import { useShoppingListMutation } from '../useShoppingListMutation';

export const useUpdateItemMutation = (): MutationResult<
  ListItem,
  { id: string; changes: ItemChanges }
> =>
  useShoppingListMutation(
    MutationName.updateItem,
    (repository, { id, changes }) => repository.updateItem(id, changes),
    [ITEMS_QUERY_KEY],
  );
