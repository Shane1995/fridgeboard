import { useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useAddItemMutation } from '../../../../hooks/useAddItemMutation';
import { UNSORTED_SHOP_ID } from '../../../../services/shoppingList/constants';
import type { QuickAddState } from './types';

export const useQuickAdd = ({ shopId }: { shopId: string }): QuickAddState => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const addItem = useAddItemMutation();
  const discarded = useRef(false);

  const close = () => {
    setIsOpen(false);
    setName('');
  };

  const add = () => {
    const trimmed = name.trim();
    if (trimmed === '') {
      return false;
    }
    addItem.mutate({ name: trimmed, shopIds: shopId === UNSORTED_SHOP_ID ? [] : [shopId] });
    setName('');
    return true;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    add();
  };

  const handleBlur = () => {
    if (!discarded.current) {
      add();
    }
    close();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      discarded.current = true;
      close();
    }
  };

  return {
    isOpen,
    name,
    open: () => {
      discarded.current = false;
      setIsOpen(true);
    },
    close,
    setName,
    handleSubmit,
    handleKeyDown,
    handleBlur,
  };
};
