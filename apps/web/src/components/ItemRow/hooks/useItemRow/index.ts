import { useOverlayState } from '@heroui/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useDeleteItemMutation } from '../../../../hooks/useDeleteItemMutation';
import { useCombineItems } from '../../../../hooks/useCombineItems';
import { useItemsQuery } from '../../../../hooks/useItemsQuery';
import { useSplitItem } from '../../../../hooks/useSplitItem';
import { useUpdateItemMutation } from '../../../../hooks/useUpdateItemMutation';
import { findDuplicates } from '../../../../services/shoppingList/utils/findDuplicates';
import type { ListItem } from '../../../../services/shoppingList/types';
import {
  COMBINE_ACTION,
  DELETE_ACTION,
  INFO_ACTION,
  SPLIT_ACTION,
  SPLIT_OUT_ACTION,
} from '../../constants';
import type { ItemRowState } from './types';

export const useItemRow = ({
  item,
  shopId,
}: {
  item: ListItem;
  shopId?: string | undefined;
}): ItemRowState => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const infoDialog = useOverlayState();
  const update = useUpdateItemMutation();
  const remove = useDeleteItemMutation();
  const items = useItemsQuery();
  const split = useSplitItem();
  const combine = useCombineItems();
  const duplicates = findDuplicates({ item, items: items.data ?? [] });

  const canSplitOut =
    shopId !== undefined && item.shopIds.length >= 2 && item.shopIds.includes(shopId);

  const startEditing = () => {
    setDraft(item.name);
    setIsEditing(true);
  };

  const cancel = () => setIsEditing(false);

  const commit = (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = draft.trim();
    setIsEditing(false);
    if (trimmed !== '' && trimmed !== item.name) {
      update.mutate({ id: item.id, changes: { name: trimmed } });
    }
  };

  const toggle = (checked: boolean) => update.mutate({ id: item.id, changes: { checked } });

  const handleMenuAction = (key: string | number) => {
    const action = String(key);
    if (action === INFO_ACTION) {
      infoDialog.open();
    } else if (action === DELETE_ACTION) {
      remove.mutate(item.id);
    } else if (action === SPLIT_ACTION) {
      void split({ item });
    } else if (action === SPLIT_OUT_ACTION) {
      void split({ item, ...(shopId === undefined ? {} : { fromShopId: shopId }) });
    } else if (action === COMBINE_ACTION) {
      void combine({ keeper: item, duplicates });
    }
  };

  const setShops = ({ shopIds }: { shopIds: string[] }) =>
    update.mutate({ id: item.id, changes: { shopIds } });

  return {
    infoDialog,
    isEditing,
    draft,
    setDraft,
    startEditing,
    commit,
    cancel,
    toggle,
    setShops,
    canSplitOut,
    canSplitAll: item.shopIds.length >= 3 || (item.shopIds.length === 2 && !canSplitOut),
    duplicateCount: duplicates.length,
    handleMenuAction,
  };
};
