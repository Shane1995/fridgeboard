import { useEffect, useRef, useState } from 'react';
import {
  PULL_IGNORED_SELECTOR,
  PULL_MAX_PX,
  PULL_RESISTANCE,
  PULL_THRESHOLD_PX,
} from './constants';
import { TOUCH_DRAG_DELAY_MS } from '../../utils/touchDragListeners/constants';
import type { PullToRefreshOptions, PullToRefreshState } from './types';

export const usePullToRefresh = ({
  onRefresh,
  enabled,
}: PullToRefreshOptions): PullToRefreshState => {
  const [distance, setDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refresh = useRef(onRefresh);
  refresh.current = onRefresh;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    let startY: number | undefined;
    let startedAt = 0;
    let pulled = 0;
    let busy = false;

    const reset = () => {
      startY = undefined;
      pulled = 0;
      setDistance(0);
    };

    const handleStart = (event: TouchEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const touch = event.touches[0];
      const blocked = busy || event.touches.length !== 1 || touch === undefined;
      startY =
        blocked || window.scrollY > 0 || target?.closest(PULL_IGNORED_SELECTOR)
          ? undefined
          : touch.clientY;
      startedAt = Date.now();
    };

    const handleMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (startY === undefined || touch === undefined) {
        return;
      }
      if (pulled === 0 && Date.now() - startedAt > TOUCH_DRAG_DELAY_MS) {
        reset();
        return;
      }
      const delta = touch.clientY - startY;
      if (delta <= 0 || window.scrollY > 0) {
        reset();
        return;
      }
      pulled = Math.min(delta * PULL_RESISTANCE, PULL_MAX_PX);
      setDistance(pulled);
    };

    const handleEnd = () => {
      const shouldRefresh = startY !== undefined && pulled >= PULL_THRESHOLD_PX;
      reset();
      if (!shouldRefresh) {
        return;
      }
      busy = true;
      setIsRefreshing(true);
      void Promise.resolve(refresh.current()).finally(() => {
        busy = false;
        setIsRefreshing(false);
      });
    };

    document.addEventListener('touchstart', handleStart, { passive: true });
    document.addEventListener('touchmove', handleMove, { passive: true });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', reset);
    document.documentElement.style.overscrollBehaviorY = 'contain';
    return () => {
      document.removeEventListener('touchstart', handleStart);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', reset);
      document.documentElement.style.overscrollBehaviorY = '';
    };
  }, [enabled]);

  return { distance, isRefreshing, isReady: distance >= PULL_THRESHOLD_PX };
};
