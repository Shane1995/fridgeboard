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

export type NewItem = { name: string; bucketId: string };
export type ItemChanges = Partial<Pick<ListItem, 'name' | 'bucketId' | 'checked'>>;
export type NewBucket = { name: string; color: BucketColor };
export type BucketChanges = Partial<Pick<Bucket, 'name' | 'color'>>;

export type ShoppingListRepository = {
  listBuckets: () => Promise<Bucket[]>;
  createBucket: (bucket: NewBucket) => Promise<Bucket>;
  updateBucket: (update: { id: string; changes: BucketChanges }) => Promise<Bucket>;
  deleteBucket: (target: { id: string }) => Promise<void>;
  reorderBuckets: (order: { ids: readonly string[] }) => Promise<Bucket[]>;
  listItems: () => Promise<ListItem[]>;
  addItem: (item: NewItem) => Promise<ListItem>;
  updateItem: (update: { id: string; changes: ItemChanges }) => Promise<ListItem>;
  deleteItem: (target: { id: string }) => Promise<void>;
  clearChecked: () => Promise<void>;
  history: () => Promise<HistoryEntry[]>;
};

export type BucketSectionData = { bucket: Bucket; items: ListItem[] };

export type GroupedItems = { sections: BucketSectionData[]; checked: ListItem[] };
