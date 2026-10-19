import { VISIBILITY_EVENT, VISIBLE } from '../constants';
import { getSession } from '../getSession';
import { refreshSession } from '../refreshSession';
import type { SessionConfig } from '../types';

export const watchSession = (config: SessionConfig): (() => void) => {
  const onVisibilityChange = (): void => {
    const { lastRefreshAt } = getSession();
    const stale =
      lastRefreshAt === undefined || Date.now() - lastRefreshAt > config.refreshMinIntervalMs;
    if (document.visibilityState === VISIBLE && stale) {
      void refreshSession(config);
    }
  };

  void refreshSession(config);
  document.addEventListener(VISIBILITY_EVENT, onVisibilityChange);
  return () => {
    document.removeEventListener(VISIBILITY_EVENT, onVisibilityChange);
  };
};
