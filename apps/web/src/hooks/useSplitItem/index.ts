import type { ListItem } from '../../services/shoppingList/types';
import { shopIdsOf } from '../../services/shoppingList/utils/shopIdsOf';
import { useAddItemMutation } from '../useAddItemMutation';
import { useShopsQuery } from '../useShopsQuery';
import { useToast } from '../useToast';
import { useUpdateItemMutation } from '../useUpdateItemMutation';
import { SPLIT_ITEM_COPY } from './constants';
import type { SplitItemOptions } from './types';

export const useSplitItem = (): ((options: SplitItemOptions) => Promise<void>) => {
  const add = useAddItemMutation({ quiet: true });
  const update = useUpdateItemMutation();
  const shops = useShopsQuery();
  const toast = useToast();

  const splitOut = async ({ item, shopId }: { item: ListItem; shopId: string }) => {
    const added = await add.mutateAsync({ name: item.name, shopIds: [shopId] });
    if (!added.ok) {
      return;
    }
    const kept = await update.mutateAsync({
      id: item.id,
      changes: { shopIds: shopIdsOf(item).filter((id) => id !== shopId) },
    });
    if (kept.ok) {
      const shopName = (shops.data ?? []).find(({ id }) => id === shopId)?.name ?? 'the shop';
      toast.success(SPLIT_ITEM_COPY.out(item.name, shopName));
    }
  };

  const splitAll = async (item: ListItem) => {
    const [first, ...others] = shopIdsOf(item);
    if (first === undefined || others.length === 0) {
      return;
    }
    const added = await Promise.all(
      others.map((shopId) => add.mutateAsync({ name: item.name, shopIds: [shopId] })),
    );
    if (!added.every(({ ok }) => ok)) {
      return;
    }
    const kept = await update.mutateAsync({ id: item.id, changes: { shopIds: [first] } });
    if (kept.ok) {
      toast.success(SPLIT_ITEM_COPY.done(item.name, item.shops.length));
    }
  };

  return async ({ item, fromShopId }) => {
    if (item.shops.length < 2) {
      return;
    }
    try {
      if (fromShopId !== undefined && shopIdsOf(item).includes(fromShopId)) {
        await splitOut({ item, shopId: fromShopId });
      } else {
        await splitAll(item);
      }
    } catch {
      return;
    }
  };
};
