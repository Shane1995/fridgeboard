import type { IVerifyNextResponse } from '@fridgeboard/contract/auth';

export enum SessionStatus {
  Loading = 'loading',
  SignedIn = 'signed-in',
  SignedOut = 'signed-out',
}

// Why a sign-in step failed. Most values arrive from the server as the reason of an error
// response; `unknown`, `cancelled` and `fallback` are decided in the browser.
export enum FailureReason {
  NoInvite = 'no-invite',
  VerifyEmail = 'verify-email',
  BadCode = 'bad-code',
  Expired = 'expired',
  Forbidden = 'forbidden',
  Unauthorised = 'unauthorised',
  RecentCodeRequired = 'recent-code-required',
  PasskeyFailed = 'passkey-failed',
  Unknown = 'unknown',
  Cancelled = 'cancelled',
  Fallback = 'fallback',
}

export const FAILURE_REASONS: readonly FailureReason[] = Object.values(FailureReason);

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

export const VISIBILITY_EVENT = 'visibilitychange';
export const VISIBLE = 'visible';
