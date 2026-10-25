import { Skeleton } from '@heroui/react';
import { HOME_COPY } from '../../constants';
import { ItemRowSkeleton } from './components/ItemRowSkeleton';
import { ShopSectionSkeleton } from './components/ShopSectionSkeleton';

export const HomeSkeleton = () => (
  <main className="mx-auto flex max-w-2xl flex-col gap-7 p-6">
    <div
      role="status"
      aria-busy="true"
      aria-label={HOME_COPY.loading}
      className="flex flex-col gap-7"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-xl md:hidden" />
        <Skeleton className="h-12 w-64 max-w-full rounded-xl" />
      </div>
      <Skeleton className="h-13 rounded-xl md:h-16 md:rounded-2xl" />
      <div className="flex gap-2">
        <Skeleton className="h-[42px] w-16 shrink-0 rounded-full" />
        <Skeleton className="h-[42px] w-28 shrink-0 rounded-full" />
      </div>
      <ShopSectionSkeleton rows={2} />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
        <ul aria-hidden="true" className="flex flex-col">
          <ItemRowSkeleton index={0} />
        </ul>
      </div>
      <Skeleton className="h-12 rounded-2xl" />
    </div>
  </main>
);
