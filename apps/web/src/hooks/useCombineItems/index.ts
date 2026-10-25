import { useDeleteItemMutation } from '../useDeleteItemMutation';
import { useToast } from '../useToast';
import { useUpdateItemMutation } from '../useUpdateItemMutation';
import { COMBINE_ITEMS_COPY } from './constants';
import type { CombineItemsOptions } from './types';

export const useCombineItems = (): ((options: CombineItemsOptions) => Promise<void>) => {
  const update = useUpdateItemMutation();
  const remove = useDeleteItemMutation();
  const toast = useToast();

  return async ({ keeper, duplicates }) => {
    const shopIds = [...new Set([keeper, ...duplicates].flatMap((item) => item.shopIds))];
    try {
      const kept = await update.mutateAsync({ id: keeper.id, changes: { shopIds } });
      if (!kept.ok) {
        return;
      }
      const removed = await Promise.all(duplicates.map(({ id }) => remove.mutateAsync(id)));
      if (removed.every(({ ok }) => ok)) {
        toast.success(COMBINE_ITEMS_COPY.done(keeper.name, duplicates.length + 1));
      }
    } catch {
      return;
    }
  };
};
