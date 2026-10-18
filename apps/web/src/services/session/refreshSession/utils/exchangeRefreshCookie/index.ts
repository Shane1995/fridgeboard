import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { UNAUTHORISED_STATUS } from '../../../../constants';
import { applyTokens } from '../../../applyTokens';
import { clearSession } from '../../../clearSession';
import { SessionStatus } from '../../../constants';
import { getEpoch } from '../../../getEpoch';
import { getSession } from '../../../getSession';
import { updateSession } from '../../../updateSession';
import { isTokenResponse } from '../../../utils/isTokenResponse';
import { postAuth } from '../../../utils/postAuth';

export const exchangeRefreshCookie = async (
  onExpiring: () => Promise<boolean>,
): Promise<boolean> => {
  const epoch = getEpoch();
  const response = await postAuth(API_PATHS.refresh).catch(() => undefined);
  const body: unknown = response?.ok ? await response.json().catch(() => undefined) : undefined;

  if (getEpoch() !== epoch) {
    return false;
  }

  if (response?.ok) {
    if (!isTokenResponse(body)) {
      clearSession();
      return false;
    }
    applyTokens(body, onExpiring);
    return true;
  }

  if (response?.status === UNAUTHORISED_STATUS) {
    clearSession();
    return false;
  }

  const { accessToken, status } = getSession();
  if (status === SessionStatus.Loading) {
    updateSession({ status: accessToken ? SessionStatus.SignedIn : SessionStatus.SignedOut });
  }
  return accessToken !== undefined;
};
