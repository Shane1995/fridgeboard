import { readLocalStorage } from '../../../../utils/readLocalStorage';
import { shoppingListStorageKey } from '../../constants';
import type { HistoryEntry, ListItem, ShoppingListState } from '../../types';

const EMPTY: ShoppingListState = { buckets: [], items: [], history: [] };

const historyFromItems = (items: ListItem[]): HistoryEntry[] =>
  items.reduce<HistoryEntry[]>((history, { name, bucketId }) => {
    const known = history.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
    return known === undefined
      ? [...history, { name, bucketId, count: 1 }]
      : history.map((entry) =>
          entry === known ? { ...known, bucketId, count: known.count + 1 } : entry,
        );
  }, []);

export const readState = (householdId: string): ShoppingListState => {
  const raw = readLocalStorage(shoppingListStorageKey(householdId));
  if (raw === undefined) {
    return EMPTY;
  }
  try {
    const parsed: Partial<ShoppingListState> = JSON.parse(raw);
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    return {
      buckets: Array.isArray(parsed.buckets) ? parsed.buckets : [],
      items,
      history: Array.isArray(parsed.history) ? parsed.history : historyFromItems(items),
    };
  } catch {
    return EMPTY;
  }
};
