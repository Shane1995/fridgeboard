import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { ReactNode } from 'react';
import { touchDragListeners } from '../../utils/touchDragListeners';
import { SORTABLE_SHOP_COPY } from './constants';

type SortableShopProps = { id: string; name: string; children: ReactNode };

export const SortableShop = ({ id, name, children }: SortableShopProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { type: 'shop' } });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`relative transition-opacity pointer-coarse:select-none pointer-coarse:[-webkit-touch-callout:none] ${isDragging ? 'opacity-40' : ''}`}
      {...touchDragListeners({ listeners })}
    >
      {children}
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`${SORTABLE_SHOP_COPY.handle}: ${name}`}
        className="absolute top-1 right-12 flex size-11 cursor-grab items-center justify-center rounded-full opacity-40 outline-none hover:opacity-100 active:cursor-grabbing pointer-coarse:hidden"
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden size={18} />
      </button>
    </div>
  );
};
