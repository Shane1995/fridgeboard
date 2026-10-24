import { MutationName } from '../../services/configuration/schema/constants';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import type { MutationResult } from '../useMutation/types';
import { useShoppingListMutation } from '../useShoppingListMutation';

export const useClearCheckedMutation = (): MutationResult<void, void> =>
  useShoppingListMutation({
    name: MutationName.clearChecked,
    write: ({ repository }) => repository.clearChecked(),
    invalidates: [ITEMS_QUERY_KEY],
    optimistic: ({ items }) => items.filter(({ checked }) => !checked),
  });
