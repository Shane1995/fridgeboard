import type { BUCKET_COLORS } from './constants.ts';

export type BucketColorName = (typeof BUCKET_COLORS)[number];

export type IListItem = {
  id: string;
  name: string;
  bucketId: string;
  checked: boolean;
  createdAt: number;
  addedBy: string;
};

export type IListItemsResponse = { items: IListItem[] };

export type ICreateListItemRequest = { name: string; bucketId?: string };

export type IUpdateListItemRequest = { name?: string; bucketId?: string; checked?: boolean };

export type IBucket = { id: string; name: string; color: BucketColorName; order: number };

export type IBucketsResponse = { buckets: IBucket[] };

export type ICreateBucketRequest = { name: string; color: BucketColorName };

export type IUpdateBucketRequest = { name?: string; color?: BucketColorName };

export type IReorderBucketsRequest = { ids: string[] };

export type IHistoryEntry = { name: string; bucketId: string; count: number };

export type IHistoryResponse = { entries: IHistoryEntry[] };

export type IListErrorResponse = {
  reason: 'not-found' | 'invalid-name' | 'invalid-bucket' | 'invalid-color' | 'invalid-request';
};
