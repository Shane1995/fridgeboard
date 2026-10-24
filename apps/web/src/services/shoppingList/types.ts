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

export type BucketSectionData = { bucket: Bucket; items: ListItem[] };

export type GroupedItems = { sections: BucketSectionData[]; checked: ListItem[] };
