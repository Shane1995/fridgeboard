import { bumpEpoch } from '../bumpEpoch';
import { clearSession } from '../clearSession';
import { REFRESH_KEY } from '../constants';
import { refreshFlights } from '../store';
import { postAuth } from '../utils/postAuth';

export const signOut = async (signOutPath: string): Promise<void> => {
  bumpEpoch();
  await Promise.resolve(refreshFlights.get(REFRESH_KEY)).catch(() => undefined);
  await postAuth(signOutPath)
    .catch(() => undefined)
    .finally(clearSession);
};
