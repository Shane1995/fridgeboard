import type { BucketColor } from './constants';

export type Bucket = { id: string; name: string; color: BucketColor; order: number };

export type ListItem = {
  id: string;
  name: string;
  bucketId: string;
  checked: boolean;
  createdAt: number;
  addedBy?: string | undefined;
};

export type HistoryEntry = { name: string; bucketId: string; count: number };

export type ShoppingListState = { buckets: Bucket[]; items: ListItem[]; history: HistoryEntry[] };

export type NewItem = { name: string; bucketId: string; addedBy?: string | undefined };
export type ItemChanges = Partial<Pick<ListItem, 'name' | 'bucketId' | 'checked'>>;
export type NewBucket = { name: string; color: BucketColor };
export type BucketChanges = Partial<Pick<Bucket, 'name' | 'color'>>;

export type ShoppingListRepository = {
  listBuckets: () => Promise<Bucket[]>;
  createBucket: (bucket: NewBucket) => Promise<Bucket>;
  updateBucket: (id: string, changes: BucketChanges) => Promise<Bucket>;
  deleteBucket: (id: string) => Promise<void>;
  reorderBuckets: (ids: readonly string[]) => Promise<Bucket[]>;
  listItems: () => Promise<ListItem[]>;
  addItem: (item: NewItem) => Promise<ListItem>;
  updateItem: (id: string, changes: ItemChanges) => Promise<ListItem>;
  deleteItem: (id: string) => Promise<void>;
  clearChecked: () => Promise<void>;
  suggest: (query: string, onList: readonly string[]) => Promise<HistoryEntry[]>;
};

export type BucketSectionData = { bucket: Bucket; items: ListItem[] };

export type GroupedItems = { sections: BucketSectionData[]; checked: ListItem[] };
