import { ShopSwatch } from '../ShopSwatch';
import type { ItemDragPreviewProps } from './types';

export const ItemDragPreview = ({ item, shops }: ItemDragPreviewProps) => (
  <div className="flex cursor-grabbing items-center gap-3 rounded-2xl border border-foreground/10 bg-white px-4 py-3 text-base shadow-xl">
    <span className="font-medium">{item.name}</span>
    <span className="flex items-center -space-x-1">
      {shops
        .filter(({ id }) => item.shopIds.includes(id))
        .map(({ id, name, color }) => (
          <span key={id} className="rounded-full ring-2 ring-white">
            <ShopSwatch color={color} name={name} />
          </span>
        ))}
    </span>
  </div>
);
