import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { ReactNode } from 'react';
import { SORTABLE_BUCKET_COPY } from './constants';

type SortableBucketProps = { id: string; name: string; children: ReactNode };

export const SortableBucket = ({ id, name, children }: SortableBucketProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`relative ${isDragging ? 'z-30 drop-shadow-xl' : ''}`}
    >
      {children}
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`${SORTABLE_BUCKET_COPY.handle}: ${name}`}
        className="absolute top-0.5 right-12 flex size-11 cursor-grab touch-none items-center justify-center rounded-full opacity-40 outline-none hover:opacity-100 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden size={18} />
      </button>
    </div>
  );
};
