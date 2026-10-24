import { useState } from 'react';
import type { FormEvent } from 'react';
import { useCreateShopMutation } from '../../../../../../hooks/useCreateShopMutation';
import { useDeleteShopMutation } from '../../../../../../hooks/useDeleteShopMutation';
import { useUpdateShopMutation } from '../../../../../../hooks/useUpdateShopMutation';
import { ShopColor } from '../../../../../../services/shoppingList/constants';
import type { Shop } from '../../../../../../services/shoppingList/types';
import type { ShopFormState } from './types';

export const useShopForm = (shop: Shop | undefined, onDone: () => void): ShopFormState => {
  const [name, setName] = useState(shop?.name ?? '');
  const [color, setColor] = useState(shop?.color ?? ShopColor.Mint);
  const create = useCreateShopMutation();
  const update = useUpdateShopMutation();
  const remove = useDeleteShopMutation();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === '') {
      return;
    }
    if (shop === undefined) {
      create.mutate({ name: trimmed, color }, { onSuccess: (result) => result.ok && onDone() });
    } else {
      update.mutate(
        { id: shop.id, changes: { name: trimmed, color } },
        { onSuccess: (result) => result.ok && onDone() },
      );
    }
  };

  const handleDelete = () => {
    if (shop !== undefined) {
      remove.mutate(shop.id, { onSuccess: (result) => result.ok && onDone() });
    }
  };

  return {
    name,
    setName,
    color,
    setColor,
    isSaving: create.isPending || update.isPending,
    isDeleting: remove.isPending,
    handleSubmit,
    handleDelete,
  };
};
