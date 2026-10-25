import { Skeleton } from '@heroui/react';
import { ItemRowSkeleton } from '../ItemRowSkeleton';
import type { ShopSectionSkeletonProps } from './types';

export const ShopSectionSkeleton = ({ rows, tagged = false }: ShopSectionSkeletonProps) => (
  <div
    aria-hidden="true"
    className={`relative flex flex-col rounded-2xl border border-foreground/10 bg-white px-4 pb-1 ${tagged ? 'pt-1' : 'pt-2'}`}
  >
    {tagged && (
      <div className="flex min-h-11 items-center gap-2 pr-24">
        <Skeleton className="h-7 w-24 rounded-lg" />
        <Skeleton className="h-4 w-4 rounded-md" />
      </div>
    )}
    <ul className="flex flex-col divide-y divide-foreground/5">
      {Array.from({ length: rows }, (_, index) => (
        <ItemRowSkeleton key={index} index={index} />
      ))}
    </ul>
  </div>
);
