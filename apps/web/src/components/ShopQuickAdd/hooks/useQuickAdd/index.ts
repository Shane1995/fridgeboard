import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useAddItemMutation } from '../../../../hooks/useAddItemMutation';
import { UNSORTED_SHOP_ID } from '../../../../services/shoppingList/constants';
import type { QuickAddState } from './types';

export const useQuickAdd = ({ shopId }: { shopId: string }): QuickAddState => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const addItem = useAddItemMutation();

  const close = () => {
    setIsOpen(false);
    setName('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === '') {
      return;
    }
    addItem.mutate({ name: trimmed, shopIds: shopId === UNSORTED_SHOP_ID ? [] : [shopId] });
    setName('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      close();
    }
  };

  return { isOpen, name, open: () => setIsOpen(true), close, setName, handleSubmit, handleKeyDown };
};
