import type { IAuthErrorReason, IVerifyNextResponse } from '@fridgeboard/contract/auth';
import type { REFRESH_KEY, SESSION_KEY, SessionStatus, UNKNOWN_REASON } from './constants';

export type SessionSnapshot = {
  accessToken: string | undefined;
  status: SessionStatus;
  lastRefreshAt: number | undefined;
};

export type SessionListener = (session: SessionSnapshot) => void;

export type SessionKey = typeof SESSION_KEY;
export type RefreshKey = typeof REFRESH_KEY;

export type FailureReason = IAuthErrorReason | typeof UNKNOWN_REASON;

export type StartResult = { ok: true } | { ok: false; reason: FailureReason };

export type VerifyResult =
  | { ok: true }
  | ({ ok: false } & IVerifyNextResponse)
  | { ok: false; reason: FailureReason };

export type SessionContext = {
  getStatus: () => SessionStatus;
  refresh: () => Promise<boolean>;
};
