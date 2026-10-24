import type { ShopColor } from '../../services/shoppingList/constants';
import { SHOP_COLOR_CLASSES, SWATCH_SIZE_CLASSES } from './constants';
import type { SwatchSize } from './constants';

type ShopSwatchProps = { color: ShopColor; size?: SwatchSize };

export const ShopSwatch = ({ color, size = 'sm' }: ShopSwatchProps) => {
  return (
    <span
      aria-hidden
      className={`inline-block rounded-full ${SWATCH_SIZE_CLASSES[size]} ${SHOP_COLOR_CLASSES[color]}`}
    />
  );
};
