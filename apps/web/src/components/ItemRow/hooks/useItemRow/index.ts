import { useOverlayState } from '@heroui/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useDeleteItemMutation } from '../../../../hooks/useDeleteItemMutation';
import { useUpdateItemMutation } from '../../../../hooks/useUpdateItemMutation';
import type { ListItem } from '../../../../services/shoppingList/types';
import { DELETE_ACTION, INFO_ACTION, MOVE_ACTION_PREFIX } from '../../constants';
import type { ItemRowState } from './types';

export const useItemRow = (item: ListItem): ItemRowState => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const infoDialog = useOverlayState();
  const update = useUpdateItemMutation();
  const remove = useDeleteItemMutation();

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
    } else if (action.startsWith(MOVE_ACTION_PREFIX)) {
      update.mutate({
        id: item.id,
        changes: { shopId: action.slice(MOVE_ACTION_PREFIX.length) },
      });
    }
  };

  return {
    infoDialog,
    isEditing,
    draft,
    setDraft,
    startEditing,
    commit,
    cancel,
    toggle,
    handleMenuAction,
  };
};
