import { UNAUTHORISED_STATUS } from '../../../../constants';
import { applyTokens } from '../../../applyTokens';
import { clearSession } from '../../../clearSession';
import { SessionStatus } from '../../../constants';
import { getEpoch } from '../../../getEpoch';
import { getSession } from '../../../getSession';
import type { SessionConfig } from '../../../types';
import { updateSession } from '../../../updateSession';
import { isTokenResponse } from '../../../utils/isTokenResponse';
import { postAuth } from '../../../utils/postAuth';

export const exchangeRefreshCookie = async (
  config: SessionConfig,
  onExpiring: () => Promise<boolean>,
): Promise<boolean> => {
  const epoch = getEpoch();
  const response = await postAuth(config.refreshPath).catch(() => undefined);
  const body: unknown = response?.ok ? await response.json().catch(() => undefined) : undefined;

  if (getEpoch() !== epoch) {
    return false;
  }

  if (response?.ok) {
    if (!isTokenResponse(body)) {
      clearSession();
      return false;
    }
    applyTokens(body, config, onExpiring);
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
