import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { bumpEpoch } from '../bumpEpoch';
import { clearSession } from '../clearSession';
import { postAuth } from '../utils/postAuth';

export const signOut = async (): Promise<void> => {
  bumpEpoch();
  await postAuth(API_PATHS.signOut)
    .catch(() => undefined)
    .finally(clearSession);
};
