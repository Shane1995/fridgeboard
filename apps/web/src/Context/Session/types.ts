import type { AuthenticationResponseJSON } from '@simplewebauthn/browser';
import type { Endpoint } from '../../services/configuration/types';
import type { SessionStatus } from '../../services/session/constants';
import type { PasskeyStartResult, StartResult, VerifyResult } from '../../services/session/types';

export type SessionContextValue = {
  status: SessionStatus;
  startSignIn: (email: string) => Promise<StartResult>;
  verifyCode: (code: string) => Promise<VerifyResult>;
  startPasskeySignIn: (email: string) => Promise<PasskeyStartResult>;
  verifyPasskey: (credential: AuthenticationResponseJSON) => Promise<VerifyResult>;
  recentCodeSignIn: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<boolean>;
  apiFetch: (endpoint: Endpoint, init?: RequestInit) => Promise<Response>;
  getToken: () => Promise<string | undefined>;
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
