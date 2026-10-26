import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { ItemRow } from '../ItemRow';
import { touchDragListeners } from '../../utils/touchDragListeners';
import type { DraggableItemRowProps } from './types';

export const DraggableItemRow = ({ item, shops, shopId }: DraggableItemRowProps) => {
  const { setNodeRef, setActivatorNodeRef, listeners, isDragging } = useDraggable({
    id: `item:${item.id}:${shopId}`,
    data: { type: 'item', item, fromShopId: shopId },
  });

  return (
    <ItemRow
      item={item}
      shops={shops}
      shopId={shopId}
      rowRef={setNodeRef}
      rowProps={touchDragListeners({ listeners })}
      isDragging={isDragging}
      handle={
        <button
          ref={setActivatorNodeRef}
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          data-testid="item-drag-handle"
          onMouseDown={(event) => listeners?.onMouseDown?.(event)}
          className="flex size-9 shrink-0 cursor-grab items-center justify-center rounded-full opacity-40 outline-none select-none hover:opacity-100 active:cursor-grabbing pointer-coarse:hidden"
        >
          <GripVertical aria-hidden size={18} />
        </button>
      }
    />
  );
};
