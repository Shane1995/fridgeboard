import type { IBucket } from '@fridgeboard/contract/lists';
import { BucketItemSchema } from '../../../../utils/items/bucketItem/index.ts';
import { bucketPrefix } from '../../../../utils/keys/bucketPrefix/index.ts';
import { HOUSEHOLD_PK_PREFIX } from '../../../../utils/keys/constants.ts';
import { toBucket } from '../toBucket/index.ts';
import type { QueryBucketsOptions } from './types.ts';

export const queryBuckets = async ({
  table,
  scope: { householdId, listId },
}: QueryBucketsOptions): Promise<IBucket[]> =>
  (
    await table.query(
      {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': `${HOUSEHOLD_PK_PREFIX}${householdId}`,
          ':prefix': bucketPrefix(listId),
        },
      },
      BucketItemSchema,
    )
  )
    .map(toBucket)
    .sort((a, b) => a.order - b.order);
