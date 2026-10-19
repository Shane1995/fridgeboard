import type { ITokenResponse } from '@fridgeboard/contract/auth';
import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useRemoteConfigContext } from '../../hooks/useRemoteConfigContext';
import { request } from '../../services/api/request';
import { UNAUTHORISED_STATUS } from '../../services/constants';
import { resolveServicePath } from '../../services/configuration/resolveServicePath';
import { exchangeRefreshCookie } from '../../services/session/exchangeRefreshCookie';
import {
  RefreshResultKind,
  SessionStatus,
  VISIBILITY_EVENT,
  VISIBLE,
} from '../../services/session/constants';
import { signOut as sendSignOut } from '../../services/session/signOut';
import { startSignIn as sendStartSignIn } from '../../services/session/startSignIn';
import type { VerifyResult } from '../../services/session/types';
import { nextRefreshDelay } from '../../services/session/utils/nextRefreshDelay';
import { withRefreshLock } from '../../services/session/utils/withRefreshLock';
import { verifyCode as sendVerifyCode } from '../../services/session/verifyCode';
import { INITIAL_RUNTIME } from './constants';
import type { SessionContextValue, SessionRuntime } from './types';

export const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const { services, settings } = useRemoteConfigContext();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.Loading);
  const runtime = useRef<SessionRuntime>({ ...INITIAL_RUNTIME });
  const config = useRef({ services, settings });
  useEffect(() => {
    config.current = { services, settings };
  }, [services, settings]);
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
    changeStatus(SessionStatus.SignedOut);
  }, [changeStatus]);

  const applyTokens = useCallback(
    ({ accessToken, expiresIn }: ITokenResponse) => {
      const state = runtime.current;
      state.epoch += 1;
      state.token = accessToken;
      state.lastRefreshAt = Date.now();
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
        resolveServicePath(config.current.services, WebService.refresh),
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

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    const state = runtime.current;
    const onVisibilityChange = (): void => {
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
      sendStartSignIn(resolveServicePath(config.current.services, WebService.start), email),
    [],
  );

  const verifyCode = useCallback(
    async (code: string): Promise<VerifyResult> => {
      const response = await sendVerifyCode(
        resolveServicePath(config.current.services, WebService.verify),
        code,
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
    await sendSignOut(resolveServicePath(config.current.services, WebService.signOut)).finally(
      clear,
    );
  }, [clear]);

  const apiFetch = useCallback(
    async (path: string, init: RequestInit = {}): Promise<Response> => {
      const state = runtime.current;
      const response = await request(path, init, state.token);
      if (
        response.status !== UNAUTHORISED_STATUS ||
        state.status === SessionStatus.SignedOut ||
        !(await refresh())
      ) {
        return response;
      }
      return request(path, init, state.token);
    },
    [refresh],
  );

  const value = useMemo<SessionContextValue>(
    () => ({ status, startSignIn, verifyCode, signOut, refresh, apiFetch }),
    [status, startSignIn, verifyCode, signOut, refresh, apiFetch],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};
