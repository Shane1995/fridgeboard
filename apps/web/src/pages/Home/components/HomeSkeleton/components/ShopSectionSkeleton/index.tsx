import { Skeleton } from '@heroui/react';
import { ItemRowSkeleton } from '../ItemRowSkeleton';
import type { ShopSectionSkeletonProps } from './types';

export const ShopSectionSkeleton = ({ rows, tagged = false }: ShopSectionSkeletonProps) => (
  <div
    aria-hidden="true"
    className={`relative flex flex-col rounded-2xl border border-foreground/10 bg-white px-4 pb-2 ${tagged ? 'pt-7' : 'pt-2'}`}
  >
    {tagged && <Skeleton className="absolute -top-3 left-4 h-7 w-24 rounded-lg" />}
    <ul className="flex flex-col divide-y divide-foreground/5">
      {Array.from({ length: rows }, (_, index) => (
        <ItemRowSkeleton key={index} index={index} />
      ))}
    </ul>
  </div>
);
