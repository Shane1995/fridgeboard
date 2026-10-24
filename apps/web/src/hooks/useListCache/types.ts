import type { IBucket, IListItem } from '@fridgeboard/contract/lists';

export type UpdateItemsOptions = { update: (items: IListItem[]) => IListItem[] };

export type UpdateBucketsOptions = { update: (buckets: IBucket[]) => IBucket[] };
