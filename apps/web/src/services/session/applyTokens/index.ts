import type { ITokenResponse } from '@fridgeboard/contract/auth';
import { bumpEpoch } from '../bumpEpoch';
import { MS_PER_SECOND, REFRESH_LEAD_MS, SessionStatus } from '../constants';
import { scheduleRefresh } from '../scheduleRefresh';
import { updateSession } from '../updateSession';

export const applyTokens = (
  { accessToken, expiresIn }: ITokenResponse,
  onExpiring: () => Promise<boolean>,
): void => {
  bumpEpoch();
  updateSession({ accessToken, status: SessionStatus.SignedIn, lastRefreshAt: Date.now() });
  scheduleRefresh(Math.max(0, expiresIn * MS_PER_SECOND - REFRESH_LEAD_MS), onExpiring);
};
