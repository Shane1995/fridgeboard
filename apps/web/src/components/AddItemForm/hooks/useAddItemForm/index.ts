import { useEffect, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useAddItemMutation } from '../../../../hooks/useAddItemMutation';
import { useShopsQuery } from '../../../../hooks/useShopsQuery';
import { useItemsQuery } from '../../../../hooks/useItemsQuery';
import { useSuggestions } from '../../../../hooks/useSuggestions';
import { useLocalStorage } from '../../../../hooks/useLocalStorage';
import {
  LAST_SHOP_STORAGE_KEY,
  UNSORTED_SHOP_ID,
} from '../../../../services/shoppingList/constants';
import { UNSORTED_SHOP } from '../../../../services/shoppingList/utils/groupItemsByShop';
import type { HistoryEntry } from '../../../../services/shoppingList/types';
import { NO_HIGHLIGHT } from './constants';
import type { AddItemFormState } from './types';

export const useAddItemForm = (focusedShopId?: string): AddItemFormState => {
  const [name, setName] = useState('');
  const [highlighted, setHighlighted] = useState(NO_HIGHLIGHT);
  const [lastShopId, setLastShopId] = useLocalStorage(LAST_SHOP_STORAGE_KEY);
  const { data } = useShopsQuery();
  const addItem = useAddItemMutation();
  const query = name.trim();
  const { data: items } = useItemsQuery();
  const onList = (items ?? []).filter(({ checked }) => !checked).map(({ name: listed }) => listed);
  const found = useSuggestions({ query, onList });

  useEffect(() => {
    if (focusedShopId !== undefined) {
      setLastShopId(focusedShopId);
    }
  }, [focusedShopId, setLastShopId]);

  const shops = [UNSORTED_SHOP, ...(data ?? [])];
  const shopId = shops.find(({ id }) => id === lastShopId)?.id ?? UNSORTED_SHOP_ID;

  const suggestions = found.filter(
    ({ name: known }) => known.toLowerCase() !== query.toLowerCase(),
  );

  const updateName = (value: string) => {
    setName(value);
    setHighlighted(NO_HIGHLIGHT);
  };

  const pickSuggestion = ({ name: picked, shopIds: pickedShops }: HistoryEntry) => {
    updateName(picked);
    const pickedShop = pickedShops.find((id) => shops.some((shop) => shop.id === id));
    if (pickedShop !== undefined) {
      setLastShopId(pickedShop);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === '' || addItem.isPending) {
      return;
    }
    addItem.mutate(
      { name: trimmed, shopIds: shopId === UNSORTED_SHOP_ID ? [] : [shopId] },
      { onSuccess: (result) => result.ok && setName('') },
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const last = suggestions.length - 1;
    if (event.key === 'ArrowDown' && last >= 0) {
      event.preventDefault();
      setHighlighted((current) => Math.min(current + 1, last));
    } else if (event.key === 'ArrowUp' && last >= 0) {
      event.preventDefault();
      setHighlighted((current) => Math.max(current - 1, NO_HIGHLIGHT));
    } else if (event.key === 'Enter' && suggestions[highlighted] !== undefined) {
      event.preventDefault();
      pickSuggestion(suggestions[highlighted]);
    }
  };

  return {
    name,
    setName: updateName,
    highlighted,
    handleKeyDown,
    shopId,
    setShopId: setLastShopId,
    shops,
    suggestions,
    pickSuggestion,
    isAdding: addItem.isPending,
    handleSubmit,
  };
};
