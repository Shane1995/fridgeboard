import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import { bumpEpoch } from '../bumpEpoch';
import { clearSession } from '../clearSession';
import { REFRESH_KEY } from '../constants';
import { refreshFlights } from '../store';
import { postAuth } from '../utils/postAuth';
import { getServicePath } from '../../configuration';

export const signOut = async (): Promise<void> => {
  bumpEpoch();
  await Promise.resolve(refreshFlights.get(REFRESH_KEY)).catch(() => undefined);
  await postAuth(getServicePath(WebService.signOut))
    .catch(() => undefined)
    .finally(clearSession);
};
