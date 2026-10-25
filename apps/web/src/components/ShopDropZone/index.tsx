import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

type ShopDropZoneProps = { shopId: string; children: ReactNode };

export const ShopDropZone = ({ shopId, children }: ShopDropZoneProps) => {
  const { setNodeRef, isOver, active } = useDroppable({
    id: `drop:${shopId}`,
    data: { type: 'shop-drop', shopId },
  });
  const isTarget = isOver && active?.data.current?.type === 'item';

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl transition-shadow ${isTarget ? 'ring-2 ring-accent ring-offset-4 ring-offset-background' : ''}`}
    >
      {children}
    </div>
  );
};
