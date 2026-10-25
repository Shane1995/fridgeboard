import type { ListItem } from '../../services/shoppingList/types';
import { decideDrop } from '../../services/shoppingList/utils/decideDrop';
import { useAddItemMutation } from '../useAddItemMutation';
import { useToast } from '../useToast';
import { useUpdateItemMutation } from '../useUpdateItemMutation';
import { MOVE_ITEM_COPY } from './constants';
import type { MoveItemOptions } from './types';

export const useMoveItem = (): ((options: MoveItemOptions) => void) => {
  const update = useUpdateItemMutation();
  const add = useAddItemMutation();
  const toast = useToast();

  const setShops = async (item: ListItem, shopIds: string[], message: string) => {
    const result = await update.mutateAsync({ id: item.id, changes: { shopIds } }).catch(() => {
      return undefined;
    });
    if (result?.ok) {
      toast.success(message, {
        label: MOVE_ITEM_COPY.undo,
        onPress: () => update.mutate({ id: item.id, changes: { shopIds: item.shopIds } }),
      });
    }
  };

  const copy = async (item: ListItem, shopId: string, message: string) => {
    const result = await add.mutateAsync({ name: item.name, shopIds: [shopId] }).catch(() => {
      return undefined;
    });
    if (result?.ok) {
      toast.success(message);
    }
  };

  return ({ item, from, to }) => {
    const { kind } = decideDrop({ item, fromShopId: from.id, toShopId: to.id });
    if (kind === 'already') {
      toast.success(MOVE_ITEM_COPY.already(item.name, to.name));
    } else if (kind === 'assign') {
      void setShops(item, [to.id], MOVE_ITEM_COPY.assigned(item.name, to.name));
    } else if (kind === 'unassign') {
      const left = item.shopIds.filter((id) => id !== from.id);
      void setShops(item, left, MOVE_ITEM_COPY.unassigned(item.name, from.name));
    } else if (kind === 'ask') {
      const stay = item.shopIds.filter((id) => id !== from.id);
      toast.confirm({
        title: MOVE_ITEM_COPY.askTitle(item.name, from.name),
        description: MOVE_ITEM_COPY.askDescription,
        actions: [
          {
            label: MOVE_ITEM_COPY.move,
            onPress: () =>
              void setShops(item, [...stay, to.id], MOVE_ITEM_COPY.moved(item.name, to.name)),
          },
          {
            label: MOVE_ITEM_COPY.alsoIn(to.name),
            onPress: () =>
              void setShops(
                item,
                [...item.shopIds, to.id],
                MOVE_ITEM_COPY.added(item.name, to.name),
              ),
          },
          {
            label: MOVE_ITEM_COPY.copy,
            onPress: () => void copy(item, to.id, MOVE_ITEM_COPY.copied(item.name, to.name)),
          },
        ],
      });
    }
  };
};
