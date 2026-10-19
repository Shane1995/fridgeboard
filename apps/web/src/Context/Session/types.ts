import type { SessionStatus } from '../../services/session/constants';
import type { StartResult, VerifyResult } from '../../services/session/types';

export type SessionContextValue = {
  status: SessionStatus;
  startSignIn: (email: string) => Promise<StartResult>;
  verifyCode: (code: string) => Promise<VerifyResult>;
  signOut: () => Promise<void>;
  refresh: () => Promise<boolean>;
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

export type SessionRuntime = {
  token: string | undefined;
  status: SessionStatus;
  epoch: number;
  lastRefreshAt: number | undefined;
  noSession: boolean;
  flight: Promise<boolean> | undefined;
  timer: ReturnType<typeof setTimeout> | undefined;
};
