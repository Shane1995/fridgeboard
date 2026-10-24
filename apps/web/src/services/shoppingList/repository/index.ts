import { MAX_SUGGESTIONS, UNSORTED_BUCKET_ID } from '../constants';
import type {
  Bucket,
  HistoryEntry,
  ListItem,
  ShoppingListRepository,
  ShoppingListState,
} from '../types';
import { readState } from '../utils/readState';
import { writeState } from '../utils/writeState';

const byOrder = (a: Bucket, b: Bucket) => a.order - b.order;

const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

const remember = (history: HistoryEntry[], name: string, bucketId: string): HistoryEntry[] => {
  const known = history.find((entry) => sameName(entry.name, name));
  return known === undefined
    ? [...history, { name, bucketId, count: 1 }]
    : history.map((entry) =>
        entry === known ? { ...known, bucketId, count: known.count + 1 } : entry,
      );
};

const missing = (what: string, id: string) => new Error(`${what} ${id} not found`);

export const shoppingListRepositoryFor = (householdId: string): ShoppingListRepository => {
  const read = () => readState(householdId);
  const write = (state: ShoppingListState) => writeState(householdId, state);

  return {
    listBuckets: async () => [...read().buckets].sort(byOrder),

    createBucket: async ({ name, color }) => {
      const state = read();
      const order = state.buckets.reduce((highest, { order }) => Math.max(highest, order), -1) + 1;
      const bucket: Bucket = { id: crypto.randomUUID(), name, color, order };
      write({ ...state, buckets: [...state.buckets, bucket] });
      return bucket;
    },

    updateBucket: async (id, changes) => {
      const state = read();
      const current = state.buckets.find((bucket) => bucket.id === id);
      if (current === undefined) {
        throw missing('bucket', id);
      }
      const updated = { ...current, ...changes };
      write({
        ...state,
        buckets: state.buckets.map((bucket) => (bucket.id === id ? updated : bucket)),
      });
      return updated;
    },

    deleteBucket: async (id) => {
      const state = read();
      write({
        ...state,
        buckets: state.buckets.filter((bucket) => bucket.id !== id),
        items: state.items.map((item) =>
          item.bucketId === id ? { ...item, bucketId: UNSORTED_BUCKET_ID } : item,
        ),
      });
    },

    reorderBuckets: async (ids) => {
      const state = read();
      const rank = (id: string) => {
        const index = ids.indexOf(id);
        return index === -1 ? ids.length : index;
      };
      const buckets = [...state.buckets]
        .sort((a, b) => rank(a.id) - rank(b.id) || a.order - b.order)
        .map((bucket, order) => ({ ...bucket, order }));
      write({ ...state, buckets });
      return buckets;
    },

    listItems: async () => [...read().items].sort((a, b) => a.createdAt - b.createdAt),

    addItem: async ({ name, bucketId, addedBy }) => {
      const state = read();
      const item: ListItem = {
        id: crypto.randomUUID(),
        name,
        bucketId,
        checked: false,
        createdAt: Date.now(),
        ...(addedBy === undefined ? {} : { addedBy }),
      };
      write({
        ...state,
        items: [...state.items, item],
        history: remember(state.history, name, bucketId),
      });
      return item;
    },

    updateItem: async (id, changes) => {
      const state = read();
      const current = state.items.find((item) => item.id === id);
      if (current === undefined) {
        throw missing('item', id);
      }
      const updated = { ...current, ...changes };
      write({
        ...state,
        items: state.items.map((item) => (item.id === id ? updated : item)),
      });
      return updated;
    },

    deleteItem: async (id) => {
      const state = read();
      write({ ...state, items: state.items.filter((item) => item.id !== id) });
    },

    suggest: async (query, onList) => {
      const needle = query.trim().toLowerCase();
      if (needle === '') {
        return [];
      }
      const starts = (entry: HistoryEntry) => (entry.name.toLowerCase().startsWith(needle) ? 0 : 1);
      return read()
        .history.filter(
          (entry) =>
            entry.name.toLowerCase().includes(needle) &&
            !onList.some((name) => sameName(name, entry.name)),
        )
        .sort((a, b) => starts(a) - starts(b) || b.count - a.count)
        .slice(0, MAX_SUGGESTIONS);
    },

    clearChecked: async () => {
      const state = read();
      write({ ...state, items: state.items.filter((item) => !item.checked) });
    },
  };
};
