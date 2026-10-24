import type { BucketColorName, IBucket } from '@fridgeboard/contract/lists';
import type * as z from 'zod/mini';
import type { BucketItemSchema } from '../../../../utils/items/bucketItem/index.ts';

export const toBucket = ({
  id,
  name,
  color,
  order,
}: z.infer<typeof BucketItemSchema>): IBucket => ({
  id,
  name,
  color: color as BucketColorName,
  order,
});
