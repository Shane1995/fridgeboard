import type { IBucket } from '@fridgeboard/contract/lists';
import { BucketColor } from '../../constants';
import type { Bucket } from '../../types';

export const toBucket = ({ id, name, color, order }: IBucket): Bucket => ({
  id,
  name,
  color: Object.values(BucketColor).find((known) => known === color) ?? BucketColor.Slate,
  order,
});
