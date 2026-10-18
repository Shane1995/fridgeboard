import type { ITokenResponse } from '@fridgeboard/contract/auth';
import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { applyTokens } from '../../../applyTokens';
import { clearSession } from '../../../clearSession';
import { UNAUTHORISED_STATUS } from '../../../constants';
import { getSession } from '../../../getSession';
import { updateSession } from '../../../updateSession';
import { postAuth } from '../../../utils/postAuth';

export const exchangeRefreshCookie = async (
  onExpiring: () => Promise<boolean>,
): Promise<boolean> => {
  const response = await postAuth(API_PATHS.refresh).catch(() => undefined);

  if (response?.ok) {
    const tokens: ITokenResponse = await response.json();
    applyTokens(tokens, onExpiring);
    return true;
  }

  if (response?.status === UNAUTHORISED_STATUS) {
    clearSession();
    return false;
  }

  const { accessToken, status } = getSession();
  if (status === 'loading') {
    updateSession({ status: accessToken ? 'signed-in' : 'signed-out' });
  }
  return accessToken !== undefined;
};
