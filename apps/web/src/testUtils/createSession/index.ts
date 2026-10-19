import type { Mock } from 'vitest';
import type { SessionContextValue } from '../../Context/Session/types';
import { SessionStatus } from '../../services/session/constants';

export const createSession = (status: SessionStatus = SessionStatus.SignedIn) => {
  const startSignIn: Mock = vi.fn();
  const verifyCode: Mock = vi.fn();
  const signOut: Mock = vi.fn();
  const refresh: Mock = vi.fn();
  const apiFetch: Mock = vi.fn();
  const session: SessionContextValue = {
    status,
    startSignIn,
    verifyCode,
    signOut,
    refresh,
    apiFetch,
  };
  return { session, startSignIn, verifyCode, signOut, refresh, apiFetch };
};
