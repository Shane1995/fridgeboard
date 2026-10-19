import type { Mock } from 'vitest';
import type { SessionContextValue } from '../../Context/Session/types';
import { SessionStatus } from '../../services/session/constants';

export const createSession = (
  status: SessionStatus = SessionStatus.SignedIn,
  recentCodeSignIn = false,
) => {
  const startSignIn: Mock = vi.fn();
  const verifyCode: Mock = vi.fn();
  const startPasskeySignIn: Mock = vi.fn();
  const verifyPasskey: Mock = vi.fn();
  const signOut: Mock = vi.fn();
  const refresh: Mock = vi.fn();
  const apiFetch: Mock = vi.fn();
  const session: SessionContextValue = {
    status,
    startSignIn,
    verifyCode,
    startPasskeySignIn,
    verifyPasskey,
    recentCodeSignIn,
    signOut,
    refresh,
    apiFetch,
  };
  return {
    session,
    startSignIn,
    verifyCode,
    startPasskeySignIn,
    verifyPasskey,
    signOut,
    refresh,
    apiFetch,
  };
};
