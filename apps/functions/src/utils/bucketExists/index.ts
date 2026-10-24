import { UNSORTED_BUCKET_ID } from '@fridgeboard/contract/lists/constants';
import { BucketItemSchema } from '../items/bucketItem/index.ts';
import { bucketKey } from '../keys/bucketKey/index.ts';
import type { ListScope } from '../resolveList/types.ts';
import type { Table } from '../table/types.ts';

export const bucketExists = async (
  table: Table,
  { householdId, listId }: ListScope,
  bucketId: string,
): Promise<boolean> =>
  bucketId === UNSORTED_BUCKET_ID ||
  (await table.get(bucketKey(householdId, listId, bucketId), BucketItemSchema)) !== undefined;
