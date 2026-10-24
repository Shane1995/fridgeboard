import { BUCKET_COLORS } from '@fridgeboard/contract/lists/constants';
import type { BucketColorName } from '@fridgeboard/contract/lists';

export const readColor = (value: unknown): BucketColorName | undefined =>
  BUCKET_COLORS.find((color) => color === value);
