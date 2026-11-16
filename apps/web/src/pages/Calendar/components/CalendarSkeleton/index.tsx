import { Skeleton } from '@heroui/react';
import { CalendarView } from '../../constants';
import { CALENDAR_SKELETON_COPY, SKELETON_AGENDA_ROWS, SKELETON_DAYS_PER_WEEK } from './constants';
import type { CalendarSkeletonProps } from './types';

const range = (count: number): number[] => Array.from({ length: count }, (_, index) => index);

// Stands in for the month grid and day agenda, or the week, while the first events of a month are
// on their way. It has the same shape as the real thing, so nothing jumps when the events arrive.
export const CalendarSkeleton = ({ view, rows }: CalendarSkeletonProps) => (
  <div
    role="status"
    aria-busy="true"
    aria-label={CALENDAR_SKELETON_COPY.label}
    className="flex flex-col gap-4"
  >
    <div aria-hidden="true" className="flex flex-col gap-4">
      {view === CalendarView.Month ? (
        <>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-separator bg-separator">
            {range(SKELETON_DAYS_PER_WEEK).map((day) => (
              <div key={day} className="flex justify-center bg-background py-2">
                <Skeleton className="h-3 w-8 rounded" />
              </div>
            ))}
            {range(rows * SKELETON_DAYS_PER_WEEK).map((day) => (
              <div
                key={day}
                data-testid="skeleton-day"
                className="flex min-h-20 flex-col gap-1.5 bg-background p-1"
              >
                <Skeleton className="size-6 rounded-full" />
                {day % 3 === 0 && <Skeleton className="h-4 w-full rounded" />}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-40 rounded-lg" />
            {range(SKELETON_AGENDA_ROWS).map((row) => (
              <div key={row} data-testid="skeleton-agenda-row" className="flex items-center gap-3">
                <Skeleton className="size-5 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-2/3 rounded" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        range(SKELETON_DAYS_PER_WEEK).map((day) => (
          <div key={day} data-testid="skeleton-week-day" className="flex flex-col gap-2">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))
      )}
    </div>
  </div>
);
