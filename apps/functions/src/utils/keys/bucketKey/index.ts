import { HOUSEHOLD_PK_PREFIX } from '../constants.ts';
import { bucketPrefix } from '../bucketPrefix/index.ts';
import type { TableKey } from '../types.ts';
import type { BucketKeyOptions } from './types.ts';

export const bucketKey = ({ householdId, listId, bucketId }: BucketKeyOptions): TableKey => ({
  PK: `${HOUSEHOLD_PK_PREFIX}${householdId}`,
  SK: `${bucketPrefix(listId)}${bucketId}`,
});
