import type { IShop, IHistoryEntry } from '@fridgeboard/contract/lists';

export type FakeItem = {
  id: string;
  name: string;
  shopIds: string[];
  checked: boolean;
  createdAt: number;
  addedBy: string;
};

export type FakeShoppingListState = {
  items: FakeItem[];
  shops: IShop[];
  history: IHistoryEntry[];
  counter: number;
};
