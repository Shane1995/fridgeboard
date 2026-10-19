import type { ITokenResponse } from '@fridgeboard/contract/auth';
import { bumpEpoch } from '../bumpEpoch';
import { WEB_SETTING } from '@fridgeboard/contract/configuration/settings/constants';
import { getSetting } from '../../configuration/getSetting';
import { MS_PER_SECOND, SessionStatus } from '../constants';
import { scheduleRefresh } from '../scheduleRefresh';
import { updateSession } from '../updateSession';

export const applyTokens = (
  { accessToken, expiresIn }: ITokenResponse,
  onExpiring: () => Promise<boolean>,
): void => {
  bumpEpoch();
  updateSession({ accessToken, status: SessionStatus.SignedIn, lastRefreshAt: Date.now() });
  scheduleRefresh(
    Math.max(0, expiresIn * MS_PER_SECOND - getSetting(WEB_SETTING.refreshLeadMs)),
    onExpiring,
  );
};
