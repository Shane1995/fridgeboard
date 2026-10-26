import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useAddItemMutation } from '../../../../hooks/useAddItemMutation';
import { useShopsQuery } from '../../../../hooks/useShopsQuery';
import { useItemsQuery } from '../../../../hooks/useItemsQuery';
import { useSuggestions } from '../../../../hooks/useSuggestions';
import type { HistoryEntry } from '../../../../services/shoppingList/types';
import { NO_HIGHLIGHT } from './constants';
import type { AddItemFormState } from './types';

export const useAddItemForm = (focusedShopId?: string): AddItemFormState => {
  const [name, setName] = useState('');
  const [highlighted, setHighlighted] = useState(NO_HIGHLIGHT);
  const [separate, setSeparate] = useState(false);
  const { data } = useShopsQuery();
  const addItem = useAddItemMutation();
  const query = name.trim();
  const { data: items } = useItemsQuery();
  const onList = (items ?? []).filter(({ checked }) => !checked).map(({ name: listed }) => listed);
  const found = useSuggestions({ query, onList });

  const shops = data ?? [];
  const [pick, setPick] = useState<{ focus: string | undefined; ids: string[] } | undefined>();
  const viewed = focusedShopId === undefined ? [] : [focusedShopId];
  const chosen = pick !== undefined && pick.focus === focusedShopId ? pick.ids : viewed;
  const shopIds = chosen.filter((id) => shops.some((shop) => shop.id === id));
  const setShopIds = (ids: string[]) => setPick({ focus: focusedShopId, ids });

  const suggestions = found.filter(
    ({ name: known }) => known.toLowerCase() !== query.toLowerCase(),
  );

  const updateName = (value: string) => {
    setName(value);
    setHighlighted(NO_HIGHLIGHT);
  };

  const pickSuggestion = ({ name: picked, shopIds: pickedShops }: HistoryEntry) => {
    updateName(picked);
    setShopIds(pickedShops.filter((id) => shops.some((shop) => shop.id === id)));
  };

  const canSeparate = shopIds.length > 1;

  const submit = (trimmed: string) => {
    const groups = separate && canSeparate ? shopIds.map((id) => [id]) : [shopIds];
    setName('');
    groups.forEach((ids) => {
      addItem.mutate({ name: trimmed, shopIds: ids });
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === '') {
      return;
    }
    submit(trimmed);
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
    shopIds,
    setShopIds,
    canSeparate,
    separate,
    setSeparate,
    shops,
    suggestions,
    pickSuggestion,
    handleSubmit,
  };
};
