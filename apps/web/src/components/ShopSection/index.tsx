import { useOverlayState } from '@heroui/react';
import { Pencil } from 'lucide-react';
import { UNSORTED_SHOP_ID } from '../../services/shoppingList/constants';
import type { Shop, ShopSectionData } from '../../services/shoppingList/types';
import { isPendingItem } from '../../services/shoppingList/utils/isPendingItem';
import { DraggableItemRow } from '../DraggableItemRow';
import { ShopDialog } from '../ShopDialog';
import { SHOP_COLOR_CLASSES, SHOP_TEXT_CLASSES } from '../ShopSwatch/constants';
import { ItemRow } from '../ItemRow';
import { Typography } from '../Typography';
import { TypographyVariant } from '../Typography/constants';
import { SHOP_SECTION_COPY } from './constants';

type ShopSectionProps = {
  section: ShopSectionData;
  allShops: readonly Shop[];
  draggable?: boolean;
};

export const ShopSection = ({
  section: { shop, items },
  allShops,
  draggable = false,
}: ShopSectionProps) => {
  const editDialog = useOverlayState();
  const isEditable = shop.id !== UNSORTED_SHOP_ID;

  return (
    <section
      aria-label={shop.name}
      className={`relative flex flex-col rounded-2xl border border-foreground/10 bg-white px-4 pb-1 ${isEditable ? 'pt-1' : 'pt-2'}`}
    >
      {isEditable && (
        <header className="flex min-h-11 items-center gap-2 pr-24">
          <h2
            className={`-rotate-1 rounded-lg px-3 py-1 text-sm font-semibold shadow-sm ${SHOP_COLOR_CLASSES[shop.color]} ${SHOP_TEXT_CLASSES[shop.color]}`}
          >
            {shop.name}
          </h2>
          <Typography variant={TypographyVariant.Caption}>{items.length}</Typography>
        </header>
      )}
      {isEditable && (
        <button
          type="button"
          aria-label={`${SHOP_SECTION_COPY.edit}: ${shop.name}`}
          onClick={editDialog.open}
          className="absolute top-1 right-1 flex size-11 cursor-pointer items-center justify-center rounded-full opacity-50 outline-none hover:bg-foreground/5 hover:opacity-100"
        >
          <Pencil aria-hidden size={16} />
        </button>
      )}
      {items.length === 0 ? (
        <Typography variant={TypographyVariant.Caption} className="pb-3">
          {SHOP_SECTION_COPY.empty}
        </Typography>
      ) : (
        <ul className="flex flex-col divide-y divide-foreground/5">
          {items.map((item) =>
            draggable && !isPendingItem(item) ? (
              <DraggableItemRow key={item.id} item={item} shops={allShops} shopId={shop.id} />
            ) : (
              <ItemRow key={item.id} item={item} shops={allShops} shopId={shop.id} />
            ),
          )}
        </ul>
      )}
      {isEditable && <ShopDialog state={editDialog} shop={shop} />}
    </section>
  );
};
