import type { ListItem } from '../../services/shoppingList/types';
import { useAddItemMutation } from '../useAddItemMutation';
import { useToast } from '../useToast';
import { useUpdateItemMutation } from '../useUpdateItemMutation';
import { SPLIT_ITEM_COPY } from './constants';

export const useSplitItem = (): ((item: ListItem) => Promise<void>) => {
  const add = useAddItemMutation();
  const update = useUpdateItemMutation();
  const toast = useToast();

  return async (item) => {
    const [first, ...others] = item.shopIds;
    if (first === undefined || others.length === 0) {
      return;
    }
    try {
      const added = await Promise.all(
        others.map((shopId) => add.mutateAsync({ name: item.name, shopIds: [shopId] })),
      );
      if (!added.every(({ ok }) => ok)) {
        return;
      }
      const kept = await update.mutateAsync({ id: item.id, changes: { shopIds: [first] } });
      if (kept.ok) {
        toast.success(SPLIT_ITEM_COPY.done(item.name, item.shopIds.length));
      }
    } catch {
      return;
    }
  };
};
