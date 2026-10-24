import type { IBucket, IHistoryEntry, IListItem } from '@fridgeboard/contract/lists';

export type FakeShoppingListState = {
  items: IListItem[];
  buckets: IBucket[];
  history: IHistoryEntry[];
  counter: number;
};
