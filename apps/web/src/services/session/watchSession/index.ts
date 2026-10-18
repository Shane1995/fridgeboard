import { REFRESH_MIN_INTERVAL_MS, VISIBILITY_EVENT, VISIBLE } from '../constants';
import { getSession } from '../getSession';
import { refreshSession } from '../refreshSession';

export const watchSession = (): (() => void) => {
  const onVisibilityChange = (): void => {
    const { lastRefreshAt } = getSession();
    const stale =
      lastRefreshAt === undefined || Date.now() - lastRefreshAt > REFRESH_MIN_INTERVAL_MS;
    if (document.visibilityState === VISIBLE && stale) {
      void refreshSession();
    }
  };

  void refreshSession();
  document.addEventListener(VISIBILITY_EVENT, onVisibilityChange);
  return () => {
    document.removeEventListener(VISIBILITY_EVENT, onVisibilityChange);
  };
};
