import { REFRESH_KEY } from '../constants';
import { refreshTimers } from '../store';
import { updateSession } from '../updateSession';

export const clearSession = (): void => {
  clearTimeout(refreshTimers.get(REFRESH_KEY));
  refreshTimers.delete(REFRESH_KEY);
  updateSession({ accessToken: undefined, status: 'signed-out' });
};
