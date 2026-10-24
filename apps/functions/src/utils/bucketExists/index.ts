import { UNSORTED_BUCKET_ID } from '@fridgeboard/contract/lists/constants';
import { BucketItemSchema } from '../items/bucketItem/index.ts';
import { bucketKey } from '../keys/bucketKey/index.ts';
import type { BucketExistsOptions } from './types.ts';

export const bucketExists = async ({
  table,
  scope,
  bucketId,
}: BucketExistsOptions): Promise<boolean> =>
  bucketId === UNSORTED_BUCKET_ID ||
  (await table.get(bucketKey({ ...scope, bucketId }), BucketItemSchema)) !== undefined;
