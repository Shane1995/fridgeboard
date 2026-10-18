import { REFRESH_KEY } from '../constants';
import { refreshFlights } from '../store';
import { withRefreshLock } from '../utils/withRefreshLock';
import { exchangeRefreshCookie } from './utils/exchangeRefreshCookie';

export const refreshSession = (): Promise<boolean> => {
  const inFlight = refreshFlights.get(REFRESH_KEY);
  if (inFlight) {
    return inFlight;
  }

  const flight = withRefreshLock(() => exchangeRefreshCookie(refreshSession)).finally(() => {
    refreshFlights.delete(REFRESH_KEY);
  });
  refreshFlights.set(REFRESH_KEY, flight);
  return flight;
};
