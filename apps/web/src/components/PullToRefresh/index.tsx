import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { PULL_INDICATOR_REST_PX, PULL_TO_REFRESH_COPY } from './constants';
import type { PullToRefreshProps } from './types';

export const PullToRefresh = ({ onRefresh, enabled }: PullToRefreshProps) => {
  const { distance, isRefreshing, isReady } = usePullToRefresh({ onRefresh, enabled });

  if (!enabled || (distance === 0 && !isRefreshing)) {
    return null;
  }

  const offset = isRefreshing ? PULL_INDICATOR_REST_PX : distance;
  const label = isRefreshing
    ? PULL_TO_REFRESH_COPY.label
    : isReady
      ? PULL_TO_REFRESH_COPY.release
      : PULL_TO_REFRESH_COPY.pull;

  return (
    <div
      role="status"
      aria-label={label}
      style={{ transform: `translateY(${offset}px)` }}
      className="pointer-events-none fixed inset-x-0 top-0 z-40 -mt-10 flex justify-center"
    >
      <span className="flex size-10 items-center justify-center rounded-full border border-foreground/10 bg-white shadow-md">
        <RefreshCw
          aria-hidden
          size={18}
          className={isRefreshing ? 'animate-spin' : ''}
          style={isRefreshing ? undefined : { transform: `rotate(${distance * 3}deg)` }}
        />
      </span>
    </div>
  );
};
