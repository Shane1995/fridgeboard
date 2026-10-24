import { MutationName } from '../../services/configuration/schema/constants';
import type { ItemChanges, ListItem } from '../../services/shoppingList/types';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import type { MutationResult } from '../useMutation/types';
import { useShoppingListMutation } from '../useShoppingListMutation';
import { SUGGESTIONS_QUERY_KEY } from '../useSuggestions/constants';

export const useUpdateItemMutation = (): MutationResult<
  ListItem,
  { id: string; changes: ItemChanges }
> =>
  useShoppingListMutation({
    name: MutationName.updateItem,
    write: ({ repository, variables }) => repository.updateItem(variables),
    invalidates: [ITEMS_QUERY_KEY, SUGGESTIONS_QUERY_KEY],
    optimistic: ({ items, variables: { id, changes } }) =>
      items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
  });
