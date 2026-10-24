import type { BucketColor } from '../../services/shoppingList/constants';
import { BUCKET_COLOR_CLASSES, SWATCH_SIZE_CLASSES } from './constants';
import type { SwatchSize } from './constants';

type BucketSwatchProps = { color: BucketColor; size?: SwatchSize };

export const BucketSwatch = ({ color, size = 'sm' }: BucketSwatchProps) => {
  return (
    <span
      aria-hidden
      className={`inline-block rounded-full ${SWATCH_SIZE_CLASSES[size]} ${BUCKET_COLOR_CLASSES[color]}`}
    />
  );
};
