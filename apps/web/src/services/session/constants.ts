import type { IVerifyNextResponse } from '@fridgeboard/contract/auth';

export enum SessionStatus {
  Loading = 'loading',
  SignedIn = 'signed-in',
  SignedOut = 'signed-out',
}

export enum RefreshResultKind {
  Tokens = 'tokens',
  Rejected = 'rejected',
  Unavailable = 'unavailable',
}

export const REFRESH_LOCK_NAME = 'fb-refresh';
export const MS_PER_SECOND = 1000;

export const POST = 'POST';

export const NEXT_STEP_STATUS = 202;
export const NEXT_ENTER_CODE: IVerifyNextResponse['next'] = 'enter-code';
export const UNKNOWN_REASON = 'unknown';

export const VISIBILITY_EVENT = 'visibilitychange';
export const VISIBLE = 'visible';
