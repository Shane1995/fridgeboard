import { MutationName } from '../../services/configuration/schema/constants';
import type { ListItem, NewItem } from '../../services/shoppingList/types';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import { SUGGESTIONS_QUERY_KEY } from '../useSuggestions/constants';
import type { MutationResult } from '../useMutation/types';
import { useShoppingListMutation } from '../useShoppingListMutation';

export const useAddItemMutation = (): MutationResult<ListItem, NewItem> =>
  useShoppingListMutation({
    name: MutationName.addItem,
    write: ({ repository, variables }) => repository.addItem(variables),
    invalidates: [ITEMS_QUERY_KEY, SUGGESTIONS_QUERY_KEY],
  });
