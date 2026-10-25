import type { FormEvent, KeyboardEvent } from 'react';
import type { Shop, HistoryEntry } from '../../../../services/shoppingList/types';

export type AddItemFormState = {
  name: string;
  setName: (name: string) => void;
  highlighted: number;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  shopId: string;
  setShopId: (shopId: string) => void;
  shops: Shop[];
  suggestions: HistoryEntry[];
  pickSuggestion: (suggestion: HistoryEntry) => void;
  isAdding: boolean;
  handleSubmit: (event: FormEvent) => void;
};
