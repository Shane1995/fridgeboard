import type { IVerifyNextResponse } from '@fridgeboard/contract/auth';
import type { SessionSnapshot } from './types';

export enum SessionStatus {
  Loading = 'loading',
  SignedIn = 'signed-in',
  SignedOut = 'signed-out',
}

export const SESSION_KEY = 'current';
export const REFRESH_KEY = 'refresh';

export const INITIAL_SESSION: SessionSnapshot = {
  accessToken: undefined,
  status: SessionStatus.Loading,
  lastRefreshAt: undefined,
};
export const INITIAL_EPOCH = 0;

export const REFRESH_LOCK_NAME = 'fb-refresh';
export const MS_PER_SECOND = 1000;

export const POST = 'POST';

export const NEXT_STEP_STATUS = 202;
export const NEXT_ENTER_CODE: IVerifyNextResponse['next'] = 'enter-code';
export const UNKNOWN_REASON = 'unknown';

export const VISIBILITY_EVENT = 'visibilitychange';
export const VISIBLE = 'visible';
