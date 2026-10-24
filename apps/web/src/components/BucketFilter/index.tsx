import type { BucketSectionData } from '../../services/shoppingList/types';
import { BUCKET_COLOR_CLASSES } from '../BucketSwatch/constants';
import { BUCKET_FILTER_COPY } from './constants';

type BucketFilterProps = {
  sections: readonly BucketSectionData[];
  focusedId: string | undefined;
  onSelect: (id: string | undefined) => void;
};

const chipClass = (selected: boolean) =>
  `flex shrink-0 snap-start cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium outline-none transition-colors ${
    selected
      ? 'border-foreground bg-foreground text-white'
      : 'border-foreground/10 bg-white hover:border-foreground/30'
  }`;

export const BucketFilter = ({ sections, focusedId, onSelect }: BucketFilterProps) => {
  const total = sections.reduce((sum, { items }) => sum + items.length, 0);

  return (
    <div
      role="group"
      aria-label={BUCKET_FILTER_COPY.label}
      className="-mx-6 flex gap-2 snap-x scroll-px-6 overflow-x-auto px-6 pb-1 [scrollbar-width:none]"
    >
      <button
        type="button"
        aria-label={`${BUCKET_FILTER_COPY.all}, ${total}`}
        aria-pressed={focusedId === undefined}
        onClick={() => onSelect(undefined)}
        className={chipClass(focusedId === undefined)}
      >
        {BUCKET_FILTER_COPY.all}
        <span className="opacity-60">{total}</span>
      </button>
      {sections.map(({ bucket, items }) => (
        <button
          key={bucket.id}
          type="button"
          aria-label={`${bucket.name}, ${items.length}`}
          aria-pressed={focusedId === bucket.id}
          onClick={() => onSelect(bucket.id)}
          className={chipClass(focusedId === bucket.id)}
        >
          <span
            aria-hidden
            className={`size-2.5 rounded-full ${BUCKET_COLOR_CLASSES[bucket.color]}`}
          />
          {bucket.name}
          <span className="opacity-60">{items.length}</span>
        </button>
      ))}
    </div>
  );
};
