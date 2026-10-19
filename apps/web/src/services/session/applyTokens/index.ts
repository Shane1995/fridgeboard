import type { ITokenResponse } from '@fridgeboard/contract/auth';
import { bumpEpoch } from '../bumpEpoch';
import { MS_PER_SECOND, SessionStatus } from '../constants';
import { scheduleRefresh } from '../scheduleRefresh';
import type { SessionConfig } from '../types';
import { updateSession } from '../updateSession';

export const applyTokens = (
  { accessToken, expiresIn }: ITokenResponse,
  { refreshLeadMs, refreshMinIntervalMs }: SessionConfig,
  onExpiring: () => Promise<boolean>,
): void => {
  bumpEpoch();
  updateSession({ accessToken, status: SessionStatus.SignedIn, lastRefreshAt: Date.now() });
  scheduleRefresh(
    Math.max(refreshMinIntervalMs, expiresIn * MS_PER_SECOND - refreshLeadMs),
    onExpiring,
  );
};
