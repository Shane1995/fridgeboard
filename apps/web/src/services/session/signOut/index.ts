import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { queryClient } from '../../queryClient';
import { clearSession } from '../clearSession';
import { postAuth } from '../utils/postAuth';

export const signOut = async (): Promise<void> => {
  await postAuth(API_PATHS.signOut)
    .catch(() => undefined)
    .finally(() => {
      clearSession();
      queryClient.clear();
    });
};
