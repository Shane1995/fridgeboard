import { MutationName } from '../../services/configuration/schema/constants';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import type { MutationResult } from '../useMutation/types';
import { useShoppingListMutation } from '../useShoppingListMutation';

export const useClearCheckedMutation = (): MutationResult<void, void> =>
  useShoppingListMutation(MutationName.clearChecked, (repository) => repository.clearChecked(), [
    ITEMS_QUERY_KEY,
  ]);
