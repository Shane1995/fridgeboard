import type { ShopColor } from '../../services/shoppingList/constants';
import { SHOP_COLOR_CLASSES, SHOP_TEXT_CLASSES, SWATCH_SIZE_CLASSES } from './constants';
import type { SwatchSize } from './constants';

type ShopSwatchProps = { color: ShopColor; name?: string; size?: SwatchSize };

export const ShopSwatch = ({ color, name, size }: ShopSwatchProps) => {
  const initial = name === undefined ? undefined : Array.from(name.trim())[0]?.toUpperCase();
  const dimensions = SWATCH_SIZE_CLASSES[size ?? (initial === undefined ? 'sm' : 'md')];
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none ${dimensions} ${SHOP_COLOR_CLASSES[color]} ${SHOP_TEXT_CLASSES[color]}`}
    >
      {initial}
    </span>
  );
};
