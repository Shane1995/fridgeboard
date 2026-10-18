import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { bumpEpoch } from '../bumpEpoch';
import { clearSession } from '../clearSession';
import { REFRESH_KEY } from '../constants';
import { refreshFlights } from '../store';
import { postAuth } from '../utils/postAuth';

export const signOut = async (): Promise<void> => {
  bumpEpoch();
  await Promise.resolve(refreshFlights.get(REFRESH_KEY)).catch(() => undefined);
  await postAuth(API_PATHS.signOut)
    .catch(() => undefined)
    .finally(clearSession);
};
