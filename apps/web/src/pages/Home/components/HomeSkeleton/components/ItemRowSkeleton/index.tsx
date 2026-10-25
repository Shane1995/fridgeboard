import { Skeleton } from '@heroui/react';
import { ROW_NAME_WIDTHS } from './constants';
import type { ItemRowSkeletonProps } from './types';

export const ItemRowSkeleton = ({ index }: ItemRowSkeletonProps) => (
  <li className="flex items-center gap-3 py-3">
    <Skeleton className="size-5 shrink-0 rounded-full" />
    <Skeleton className={`h-4 ${ROW_NAME_WIDTHS[index % ROW_NAME_WIDTHS.length]}`} />
    <span className="ml-auto flex shrink-0 items-center">
      <span className="size-9" />
      <span className="flex size-10 items-center justify-center">
        <Skeleton className="size-5 rounded-full" />
      </span>
    </span>
  </li>
);
