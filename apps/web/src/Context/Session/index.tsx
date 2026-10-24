import type { ITokenResponse } from '@fridgeboard/contract/auth';
import { MutationName } from '../../services/configuration/mutations/constants';
import { WebService } from '../../services/configuration/services/constants';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { AuthenticationResponseJSON } from '@simplewebauthn/browser';
import { useRemoteConfigContext } from '../../hooks/useRemoteConfigContext';
import type { Endpoint } from '../../services/configuration/types';
import { request } from '../../services/api/request';
import { UNAUTHORISED_STATUS } from '../../services/constants';
import { resolveMutationEndpoint } from '../../services/configuration/resolveEndpoint';
import { exchangeRefreshCookie } from '../../services/session/exchangeRefreshCookie';
import {
  RefreshResultKind,
  SessionStatus,
  VISIBILITY_EVENT,
  VISIBLE,
} from '../../services/session/constants';
import { signOut as sendSignOut } from '../../services/session/signOut';
import { startPasskey as sendStartPasskey } from '../../services/session/startPasskey';
import { startSignIn as sendStartSignIn } from '../../services/session/startSignIn';
import type { VerifyResult } from '../../services/session/types';
import { nextRefreshDelay } from '../../services/session/utils/nextRefreshDelay';
import { withRefreshLock } from '../../services/session/utils/withRefreshLock';
import { verifyCode as sendVerifyCode } from '../../services/session/verifyCode';
import { verifyPasskey as sendVerifyPasskey } from '../../services/session/verifyPasskey';
import { INITIAL_RUNTIME, RECENT_CODE_WINDOW_MS } from './constants';
import type { SessionContextValue, SessionRuntime } from './types';

export const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const configuration = useRemoteConfigContext();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.Loading);
  const [recentCodeSignIn, setRecentCodeSignIn] = useState(false);
  const recentCodeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const runtime = useRef<SessionRuntime>({ ...INITIAL_RUNTIME });
  const config = useRef(configuration);
  useEffect(() => {
    config.current = configuration;
  }, [configuration]);
  const refreshRef = useRef<() => Promise<boolean>>(async () => false);

  const changeStatus = useCallback(
    (next: SessionStatus) => {
      runtime.current.status = next;
      setStatus(next);
      if (next === SessionStatus.SignedOut) {
        queryClient.clear();
      }
    },
    [queryClient],
  );

  const clear = useCallback(() => {
    const state = runtime.current;
    state.epoch += 1;
    clearTimeout(state.timer);
    state.timer = undefined;
    state.token = undefined;
    state.noSession = true;
    clearTimeout(recentCodeTimer.current);
    setRecentCodeSignIn(false);
    changeStatus(SessionStatus.SignedOut);
  }, [changeStatus]);

  const applyTokens = useCallback(
    ({ accessToken, expiresIn }: ITokenResponse) => {
      const state = runtime.current;
      state.epoch += 1;
      state.token = accessToken;
      state.lastRefreshAt = Date.now();
      state.noSession = false;
      changeStatus(SessionStatus.SignedIn);
      clearTimeout(state.timer);
      const { refreshLeadMs, refreshMinIntervalMs } = config.current.settings;
      state.timer = setTimeout(
        () => {
          void refreshRef.current();
        },
        nextRefreshDelay(expiresIn, refreshLeadMs, refreshMinIntervalMs),
      );
    },
    [changeStatus],
  );

  const refresh = useCallback((): Promise<boolean> => {
    const state = runtime.current;
    if (state.flight) {
      return state.flight;
    }

    const flight = withRefreshLock(async () => {
      const epoch = state.epoch;
      const result = await exchangeRefreshCookie(
        resolveMutationEndpoint(config.current, WebService.refresh),
      );
      if (state.epoch !== epoch) {
        return false;
      }
      if (result.kind === RefreshResultKind.Tokens) {
        applyTokens(result.tokens);
        return true;
      }
      if (result.kind === RefreshResultKind.Rejected) {
        clear();
        return false;
      }
      if (state.status === SessionStatus.Loading) {
        changeStatus(state.token ? SessionStatus.SignedIn : SessionStatus.SignedOut);
      }
      return state.token !== undefined;
    }).finally(() => {
      state.flight = undefined;
    });
    state.flight = flight;
    return flight;
  }, [applyTokens, changeStatus, clear]);

  useEffect(() => () => clearTimeout(recentCodeTimer.current), []);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    const state = runtime.current;
    const onVisibilityChange = (): void => {
      if (state.noSession) {
        return;
      }
      const stale =
        state.lastRefreshAt === undefined ||
        Date.now() - state.lastRefreshAt > config.current.settings.refreshMinIntervalMs;
      if (document.visibilityState === VISIBLE && stale) {
        void refresh();
      }
    };

    void refresh();
    document.addEventListener(VISIBILITY_EVENT, onVisibilityChange);
    return () => {
      document.removeEventListener(VISIBILITY_EVENT, onVisibilityChange);
      clearTimeout(state.timer);
    };
  }, [refresh]);

  const startSignIn = useCallback(
    (email: string) =>
      sendStartSignIn(resolveMutationEndpoint(config.current, WebService.requestCode), email),
    [],
  );

  const verifyCode = useCallback(
    async (code: string): Promise<VerifyResult> => {
      const response = await sendVerifyCode(
        resolveMutationEndpoint(config.current, WebService.verify),
        code,
      );
      if (!response.ok) {
        return response;
      }
      applyTokens(response.tokens);
      clearTimeout(recentCodeTimer.current);
      setRecentCodeSignIn(true);
      recentCodeTimer.current = setTimeout(() => setRecentCodeSignIn(false), RECENT_CODE_WINDOW_MS);
      return { ok: true };
    },
    [applyTokens],
  );

  const startPasskeySignIn = useCallback(
    (email: string) =>
      sendStartPasskey(resolveMutationEndpoint(config.current, WebService.passkeyStart), email),
    [],
  );

  const verifyPasskey = useCallback(
    async (credential: AuthenticationResponseJSON): Promise<VerifyResult> => {
      const response = await sendVerifyPasskey(
        resolveMutationEndpoint(config.current, WebService.passkeyVerify),
        credential,
      );
      if (!response.ok) {
        return response;
      }
      applyTokens(response.tokens);
      return { ok: true };
    },
    [applyTokens],
  );

  const signOut = useCallback(async (): Promise<void> => {
    const state = runtime.current;
    state.epoch += 1;
    await Promise.resolve(state.flight).catch(() => undefined);
    await sendSignOut(
      resolveMutationEndpoint(config.current, WebService.signOut, MutationName.signOut),
    ).finally(clear);
  }, [clear]);

  const apiFetch = useCallback(
    async (endpoint: Endpoint, init: RequestInit = {}): Promise<Response> => {
      const state = runtime.current;
      const response = await request(endpoint, init, state.token);
      if (
        response.status !== UNAUTHORISED_STATUS ||
        state.status === SessionStatus.SignedOut ||
        !(await refresh())
      ) {
        return response;
      }
      return request(endpoint, init, state.token);
    },
    [refresh],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      startSignIn,
      verifyCode,
      startPasskeySignIn,
      verifyPasskey,
      recentCodeSignIn,
      signOut,
      refresh,
      apiFetch,
    }),
    [
      status,
      startSignIn,
      verifyCode,
      startPasskeySignIn,
      verifyPasskey,
      recentCodeSignIn,
      signOut,
      refresh,
      apiFetch,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};
