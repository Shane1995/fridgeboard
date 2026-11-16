import type { ListItem } from '../../services/shoppingList/types';
import { shopIdsOf } from '../../services/shoppingList/utils/shopIdsOf';
import { useAddItemMutation } from '../useAddItemMutation';
import { useDeleteItemMutation } from '../useDeleteItemMutation';
import { useToast } from '../useToast';
import { useUpdateItemMutation } from '../useUpdateItemMutation';
import { REMOVE_ITEM_COPY } from './constants';

// Deleting one item is quiet and undoable rather than asking first: the toast carries an Undo
// that puts the item back in the same shops, ticked if it was ticked.
export const useRemoveItem = (): ((item: ListItem) => Promise<void>) => {
  const remove = useDeleteItemMutation();
  const add = useAddItemMutation({ quiet: true });
  const update = useUpdateItemMutation();
  const toast = useToast();

  const restore = async (item: ListItem) => {
    const result = await add.mutateAsync({ name: item.name, shopIds: shopIdsOf(item) });
    if (result.ok && item.checked) {
      update.mutate({ id: result.data.id, changes: { checked: true } });
    }
  };

  return async (item) => {
    const result = await remove.mutateAsync(item.id).catch(() => undefined);
    if (result?.ok) {
      toast.success(REMOVE_ITEM_COPY.removed(item.name), {
        label: REMOVE_ITEM_COPY.undo,
        onPress: () => void restore(item).catch(() => undefined),
      });
    }
  };
};
