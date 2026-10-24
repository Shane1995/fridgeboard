import type { ShopSectionData } from '../../services/shoppingList/types';
import { SHOP_COLOR_CLASSES } from '../ShopSwatch/constants';
import { SHOP_FILTER_COPY } from './constants';

type ShopFilterProps = {
  sections: readonly ShopSectionData[];
  focusedId: string | undefined;
  onSelect: (id: string | undefined) => void;
};

const chipClass = (selected: boolean) =>
  `flex shrink-0 snap-start cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium outline-none transition-colors ${
    selected
      ? 'border-foreground bg-foreground text-white'
      : 'border-foreground/10 bg-white hover:border-foreground/30'
  }`;

export const ShopFilter = ({ sections, focusedId, onSelect }: ShopFilterProps) => {
  const total = new Set(sections.flatMap(({ items }) => items.map(({ id }) => id))).size;

  return (
    <div
      role="group"
      aria-label={SHOP_FILTER_COPY.label}
      className="-mx-6 flex gap-2 snap-x scroll-px-6 overflow-x-auto px-6 pb-1 [scrollbar-width:none]"
    >
      <button
        type="button"
        aria-label={`${SHOP_FILTER_COPY.all}, ${total}`}
        aria-pressed={focusedId === undefined}
        onClick={() => onSelect(undefined)}
        className={chipClass(focusedId === undefined)}
      >
        {SHOP_FILTER_COPY.all}
        <span className="opacity-60">{total}</span>
      </button>
      {sections.map(({ shop, items }) => (
        <button
          key={shop.id}
          type="button"
          aria-label={`${shop.name}, ${items.length}`}
          aria-pressed={focusedId === shop.id}
          onClick={() => onSelect(shop.id)}
          className={chipClass(focusedId === shop.id)}
        >
          <span aria-hidden className={`size-2.5 rounded-full ${SHOP_COLOR_CLASSES[shop.color]}`} />
          {shop.name}
          <span className="opacity-60">{items.length}</span>
        </button>
      ))}
    </div>
  );
};
