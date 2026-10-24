import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
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
import type { AddItemFormState } from './types';

export const useAddItemForm = (focusedShopId?: string): AddItemFormState => {
  const [name, setName] = useState('');
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

  const pickSuggestion = ({ name: picked, shopId: pickedShop }: HistoryEntry) => {
    setName(picked);
    if (shops.some(({ id }) => id === pickedShop)) {
      setLastShopId(pickedShop);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === '' || addItem.isPending) {
      return;
    }
    addItem.mutate({ name: trimmed, shopId }, { onSuccess: (result) => result.ok && setName('') });
  };

  return {
    name,
    setName,
    shopId,
    setShopId: setLastShopId,
    shops,
    suggestions,
    pickSuggestion,
    isAdding: addItem.isPending,
    handleSubmit,
  };
};
