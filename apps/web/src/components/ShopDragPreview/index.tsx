import { SHOP_COLOR_CLASSES, SHOP_TEXT_CLASSES } from '../ShopSwatch/constants';
import { Typography } from '../Typography';
import { TypographyVariant } from '../Typography/constants';
import type { ShopDragPreviewProps } from './types';

export const ShopDragPreview = ({ section: { shop, items } }: ShopDragPreviewProps) => (
  <div className="flex w-full cursor-grabbing items-center gap-2 rounded-2xl border border-foreground/10 bg-white px-4 py-3 shadow-xl">
    <span
      className={`rounded-lg px-3 py-1 text-sm font-semibold shadow-sm ${SHOP_COLOR_CLASSES[shop.color]} ${SHOP_TEXT_CLASSES[shop.color]}`}
    >
      {shop.name}
    </span>
    <Typography variant={TypographyVariant.Caption}>{items.length}</Typography>
  </div>
);
