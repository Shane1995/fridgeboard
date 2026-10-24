import { useOverlayState } from '@heroui/react';
import { Pencil } from 'lucide-react';
import { UNSORTED_BUCKET_ID } from '../../services/shoppingList/constants';
import type { Bucket, BucketSectionData } from '../../services/shoppingList/types';
import { BucketDialog } from '../BucketDialog';
import { BUCKET_COLOR_CLASSES, BUCKET_TEXT_CLASSES } from '../BucketSwatch/constants';
import { ItemRow } from '../ItemRow';
import { Typography } from '../Typography';
import { TypographyVariant } from '../Typography/constants';
import { BUCKET_SECTION_COPY } from './constants';

type BucketSectionProps = { section: BucketSectionData; allBuckets: readonly Bucket[] };

export const BucketSection = ({ section: { bucket, items }, allBuckets }: BucketSectionProps) => {
  const editDialog = useOverlayState();
  const isEditable = bucket.id !== UNSORTED_BUCKET_ID;
  const moveTargets = allBuckets.filter(({ id }) => id !== bucket.id);

  return (
    <section
      aria-label={bucket.name}
      className={`relative flex flex-col rounded-2xl border border-foreground/10 bg-white px-4 pb-2 ${isEditable ? 'pt-7' : 'pt-2'}`}
    >
      {isEditable && (
        <header className="absolute -top-3 left-4 flex items-center gap-2">
          <h2
            className={`-rotate-1 rounded-lg px-3 py-1 text-sm font-semibold shadow-sm ${BUCKET_COLOR_CLASSES[bucket.color]} ${BUCKET_TEXT_CLASSES[bucket.color]}`}
          >
            {bucket.name}
          </h2>
          <Typography variant={TypographyVariant.Caption}>{items.length}</Typography>
        </header>
      )}
      {isEditable && (
        <button
          type="button"
          aria-label={`${BUCKET_SECTION_COPY.edit}: ${bucket.name}`}
          onClick={editDialog.open}
          className="absolute top-0.5 right-1 flex size-11 cursor-pointer items-center justify-center rounded-full opacity-50 outline-none hover:bg-foreground/5 hover:opacity-100"
        >
          <Pencil aria-hidden size={16} />
        </button>
      )}
      {items.length === 0 ? (
        <Typography variant={TypographyVariant.Caption} className="pb-3">
          {BUCKET_SECTION_COPY.empty}
        </Typography>
      ) : (
        <ul className="flex flex-col divide-y divide-foreground/5">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} moveTargets={moveTargets} />
          ))}
        </ul>
      )}
      {isEditable && <BucketDialog state={editDialog} bucket={bucket} />}
    </section>
  );
};
