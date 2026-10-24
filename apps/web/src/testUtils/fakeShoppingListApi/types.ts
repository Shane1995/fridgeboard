import type { IShop, IHistoryEntry, IListItem } from '@fridgeboard/contract/lists';

export type FakeShoppingListState = {
  items: IListItem[];
  shops: IShop[];
  history: IHistoryEntry[];
  counter: number;
};
