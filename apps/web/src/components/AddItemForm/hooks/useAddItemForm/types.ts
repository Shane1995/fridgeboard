import type { FormEvent, KeyboardEvent } from 'react';
import type { Shop, HistoryEntry } from '../../../../services/shoppingList/types';

export type AddItemFormState = {
  name: string;
  setName: (name: string) => void;
  highlighted: number;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  shopIds: string[];
  setShopIds: (shopIds: string[]) => void;
  canSeparate: boolean;
  separate: boolean;
  setSeparate: (separate: boolean) => void;
  shops: Shop[];
  suggestions: HistoryEntry[];
  pickSuggestion: (suggestion: HistoryEntry) => void;
  handleSubmit: (event: FormEvent) => void;
};
