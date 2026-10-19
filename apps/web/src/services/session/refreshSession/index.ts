import { REFRESH_KEY } from '../constants';
import { refreshFlights } from '../store';
import type { SessionConfig } from '../types';
import { withRefreshLock } from '../utils/withRefreshLock';
import { exchangeRefreshCookie } from './utils/exchangeRefreshCookie';

export const refreshSession = (config: SessionConfig): Promise<boolean> => {
  const inFlight = refreshFlights.get(REFRESH_KEY);
  if (inFlight) {
    return inFlight;
  }

  const flight = withRefreshLock(() =>
    exchangeRefreshCookie(config, () => refreshSession(config)),
  ).finally(() => {
    refreshFlights.delete(REFRESH_KEY);
  });
  refreshFlights.set(REFRESH_KEY, flight);
  return flight;
};
