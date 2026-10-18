import type { ITokenResponse } from '@fridgeboard/contract/auth';
import { MS_PER_SECOND, REFRESH_LEAD_MS } from '../constants';
import { scheduleRefresh } from '../scheduleRefresh';
import { updateSession } from '../updateSession';

export const applyTokens = (
  { accessToken, expiresIn }: ITokenResponse,
  onExpiring: () => Promise<boolean>,
): void => {
  updateSession({ accessToken, status: 'signed-in', lastRefreshAt: Date.now() });
  scheduleRefresh(Math.max(0, expiresIn * MS_PER_SECOND - REFRESH_LEAD_MS), onExpiring);
};
