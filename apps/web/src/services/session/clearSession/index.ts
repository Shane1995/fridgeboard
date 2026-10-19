import { bumpEpoch } from '../bumpEpoch';
import { REFRESH_KEY, SessionStatus } from '../constants';
import { refreshTimers } from '../store';
import { updateSession } from '../updateSession';

export const clearSession = (): void => {
  bumpEpoch();
  clearTimeout(refreshTimers.get(REFRESH_KEY));
  refreshTimers.delete(REFRESH_KEY);
  updateSession({ accessToken: undefined, status: SessionStatus.SignedOut });
};
