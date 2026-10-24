import { readLocalStorage } from '../../../../utils/readLocalStorage';
import { BucketColor, shoppingListStorageKey } from '../../constants';
import type { Bucket, HistoryEntry, ListItem, ShoppingListState } from '../../types';
import { writeState } from '../writeState';

const BUCKETS: Bucket[] = [
  { id: 'demo-express', name: 'Express run', color: BucketColor.Mint, order: 0 },
  { id: 'demo-sainsburys', name: "Sainsbury's order", color: BucketColor.Sky, order: 1 },
  { id: 'demo-market', name: 'Market Saturday', color: BucketColor.Mustard, order: 2 },
];

const ITEMS: [string, string, boolean][] = [
  ['Milk', 'demo-express', false],
  ['Sourdough', 'demo-express', false],
  ['Bananas', 'demo-express', true],
  ['Oat milk', 'demo-sainsburys', false],
  ['Washing-up liquid', 'demo-sainsburys', false],
  ['Toilet roll', 'demo-sainsburys', false],
  ['Chicken thighs', 'demo-sainsburys', false],
  ['Tomatoes', 'demo-market', false],
  ['Coriander', 'demo-market', false],
  ['Batteries', 'unsorted', false],
  ['Eggs', 'demo-express', true],
];

export const seedDemoList = (householdId: string): void => {
  if (readLocalStorage(shoppingListStorageKey(householdId)) !== undefined) {
    return;
  }
  const items: ListItem[] = ITEMS.map(([name, bucketId, checked], index) => ({
    id: `demo-${index}`,
    name,
    bucketId,
    checked,
    createdAt: Date.now() - (ITEMS.length - index) * 3_600_000,
    addedBy: index % 2 === 0 ? 'admin' : 'natassia',
  }));
  const history: HistoryEntry[] = items.map(({ name, bucketId }) => ({ name, bucketId, count: 1 }));
  const state: ShoppingListState = { buckets: BUCKETS, items, history };
  writeState(householdId, state);
};
