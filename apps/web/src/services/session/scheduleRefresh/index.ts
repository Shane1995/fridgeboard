import { REFRESH_KEY } from '../constants';
import { refreshTimers } from '../store';

export const scheduleRefresh = (delayMs: number, run: () => Promise<boolean>): void => {
  clearTimeout(refreshTimers.get(REFRESH_KEY));
  refreshTimers.set(
    REFRESH_KEY,
    setTimeout(() => {
      void run();
    }, delayMs),
  );
};
