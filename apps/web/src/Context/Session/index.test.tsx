import type { ITokenResponse } from '@fridgeboard/contract/auth';
import { WebService } from '../../services/configuration/schema/constants';
import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import type { WebConfiguration } from '../../hooks/useRemoteConfigContext/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useSessionContext } from '../../hooks/useSessionContext';
import { RemoteConfigContext } from '../RemoteConfig/context';
import { SessionProvider } from '.';
import { endpoint } from '../../testUtils/endpoint';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';

const TOKENS: ITokenResponse = { accessToken: 'token-1', expiresIn: 900 };

const respond = (status: number, body?: unknown): Response =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

const fetchMock = vi.fn<typeof fetch>();

const setVisibility = (state: DocumentVisibilityState): void => {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
};

const advance = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

const renderSession = async (
  configuration: WebConfiguration = TEST_WEB_CONFIGURATION,
  client = new QueryClient(),
) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <RemoteConfigContext.Provider value={configuration}>
        <SessionProvider>{children}</SessionProvider>
      </RemoteConfigContext.Provider>
    </QueryClientProvider>
  );
  const rendered = renderHook(() => useSessionContext(), { wrapper });
  await advance(0);
  return rendered;
};

const withSettings = (settings: Partial<WebConfiguration['settings']>): WebConfiguration => ({
  ...TEST_WEB_CONFIGURATION,
  settings: { ...TEST_WEB_CONFIGURATION.settings, ...settings },
});

const headersOf = (call: number): Headers => new Headers(fetchMock.mock.calls[call]?.[1]?.headers);

describe('SessionProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    fetchMock.mockReset();
    fetchMock.mockImplementation(async () => respond(200, TOKENS));
    vi.stubGlobal('fetch', fetchMock);
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    Reflect.deleteProperty(navigator, 'locks');
    Reflect.deleteProperty(document, 'visibilityState');
  });

  describe('startup refresh', () => {
    it('starts loading, then signs in when the refresh cookie is accepted', async () => {
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <QueryClientProvider client={new QueryClient()}>
            <RemoteConfigContext.Provider value={TEST_WEB_CONFIGURATION}>
              <SessionProvider>{children}</SessionProvider>
            </RemoteConfigContext.Provider>
          </QueryClientProvider>
        ),
      });
      expect(result.current.status).toBe('loading');

      await advance(0);

      expect(result.current.status).toBe('signed-in');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        API_PATHS.refresh,
        expect.objectContaining({ method: 'POST', credentials: 'same-origin' }),
      );
    });

    it('signs out and clears the query cache on 401', async () => {
      fetchMock.mockResolvedValue(respond(401, { reason: 'unauthorised' }));
      const client = new QueryClient();
      client.setQueryData(['me'], { email: 'a@b.com' });

      const { result } = await renderSession(TEST_WEB_CONFIGURATION, client);

      expect(result.current.status).toBe('signed-out');
      expect(client.getQueryData(['me'])).toBeUndefined();
    });

    it('signs out when the network fails at launch', async () => {
      fetchMock.mockRejectedValue(new TypeError('offline'));

      const { result } = await renderSession();

      expect(result.current.status).toBe('signed-out');
    });

    it('signs out without rejecting when the 200 body is malformed', async () => {
      fetchMock.mockResolvedValue(new Response('{', { status: 200 }));

      const { result } = await renderSession();

      expect(result.current.status).toBe('signed-out');
      await expect(result.current.refresh()).resolves.toBe(false);
    });
  });

  describe('refresh', () => {
    it('sends one request when called three times concurrently', async () => {
      const { result } = await renderSession();
      fetchMock.mockClear();

      const results = await act(() =>
        Promise.all([result.current.refresh(), result.current.refresh(), result.current.refresh()]),
      );

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(results).toEqual([true, true, true]);
    });

    it('sends a new request once the previous one has settled', async () => {
      const { result } = await renderSession();
      fetchMock.mockClear();

      await act(async () => {
        await result.current.refresh();
        await result.current.refresh();
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('resolves false and signs out on 401', async () => {
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(401, { reason: 'unauthorised' }));

      await expect(act(() => result.current.refresh())).resolves.toBe(false);

      expect(result.current.status).toBe('signed-out');
    });

    it('keeps the token when the refresh fails with a server error', async () => {
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(500));

      await expect(act(() => result.current.refresh())).resolves.toBe(true);

      expect(result.current.status).toBe('signed-in');
    });

    it('runs inside the fb-refresh web lock when available', async () => {
      const request = vi.fn((_name: string, callback: () => Promise<boolean>) => callback());
      Object.defineProperty(navigator, 'locks', { value: { request }, configurable: true });

      await renderSession();

      expect(request).toHaveBeenCalledWith('fb-refresh', expect.any(Function));
    });

    it('schedules the next refresh 60s before expiry', async () => {
      await renderSession();
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await advance(839_999);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await advance(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('floors the delay at the minimum refresh interval when the token expires soon', async () => {
      fetchMock.mockImplementation(async () => respond(200, { ...TOKENS, expiresIn: 30 }));
      await renderSession();

      await advance(59_999);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await advance(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('uses the configured refresh lead', async () => {
      await renderSession(withSettings({ refreshLeadMs: 300_000 }));

      await advance(599_999);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await advance(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('stops scheduling after sign-out', async () => {
      const { result } = await renderSession();
      fetchMock.mockResolvedValue(respond(204));
      await act(() => result.current.signOut());
      fetchMock.mockClear();

      await advance(900_000);

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('stops scheduling once unmounted', async () => {
      const { unmount } = await renderSession();
      unmount();

      await advance(900_000);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('drops a result that lands after the session was cleared', async () => {
      const release: ((response: Response) => void)[] = [];
      fetchMock.mockReturnValueOnce(new Promise<Response>((resolve) => release.push(resolve)));
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(204));

      const signingOut = act(() => result.current.signOut());
      release[0]?.(respond(200, TOKENS));
      await signingOut;

      expect(result.current.status).toBe('signed-out');
      await advance(900_000);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('visibility', () => {
    it('refreshes on becoming visible when the last refresh was over 60s ago', async () => {
      await renderSession();
      await advance(30_000);

      setVisibility('visible');
      await advance(0);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await advance(31_000);
      setVisibility('visible');
      await advance(0);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('ignores the page becoming hidden', async () => {
      await renderSession();
      await advance(120_000);

      setVisibility('hidden');
      await advance(0);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('refreshes when visible after a failed launch', async () => {
      fetchMock.mockRejectedValueOnce(new TypeError('offline'));
      await renderSession();

      setVisibility('visible');
      await advance(0);

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('does not refresh on becoming visible once the server rejected the refresh cookie', async () => {
      fetchMock.mockResolvedValue(respond(401));
      await renderSession();
      await advance(120_000);

      setVisibility('visible');
      await advance(0);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('does not refresh on becoming visible after signing out', async () => {
      const { result } = await renderSession();
      fetchMock.mockResolvedValue(respond(204));
      await act(() => result.current.signOut());
      const callsAfterSignOut = fetchMock.mock.calls.length;
      await advance(120_000);

      setVisibility('visible');
      await advance(0);

      expect(fetchMock).toHaveBeenCalledTimes(callsAfterSignOut);
    });

    it('refreshes on becoming visible again after signing in', async () => {
      fetchMock.mockResolvedValueOnce(respond(401));
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(200, TOKENS));
      await act(() => result.current.verifyCode('123456'));
      await advance(61_000);
      const callsBefore = fetchMock.mock.calls.length;

      setVisibility('visible');
      await advance(0);

      expect(fetchMock).toHaveBeenCalledTimes(callsBefore + 1);
    });

    it('stops listening once unmounted', async () => {
      const { unmount } = await renderSession();
      await advance(120_000);
      unmount();

      setVisibility('visible');
      await advance(0);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('uses the configured minimum refresh interval', async () => {
      await renderSession(withSettings({ refreshMinIntervalMs: 120_000 }));
      await advance(90_000);

      setVisibility('visible');
      await advance(0);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await advance(31_000);
      setVisibility('visible');
      await advance(0);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('startSignIn', () => {
    it('posts the email to the start path', async () => {
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(204));

      await expect(act(() => result.current.startSignIn('jess@example.com'))).resolves.toEqual({
        ok: true,
      });

      expect(fetchMock).toHaveBeenLastCalledWith(
        API_PATHS.start,
        expect.objectContaining({ body: JSON.stringify({ email: 'jess@example.com' }) }),
      );
    });

    it('follows a served service path', async () => {
      const { result } = await renderSession({
        ...TEST_WEB_CONFIGURATION,
        services: {
          api: {
            endpoints: {
              ...TEST_WEB_CONFIGURATION.services.api.endpoints,
              [WebService.requestCode]: '/api/v2/auth/start',
            },
          },
        },
      });
      fetchMock.mockResolvedValueOnce(respond(204));

      await act(() => result.current.startSignIn('jess@example.com'));

      expect(fetchMock.mock.lastCall?.[0]).toBe('/api/v2/auth/start');
    });
  });

  describe('verifyCode', () => {
    it('signs in and keeps the access token in memory only', async () => {
      fetchMock.mockResolvedValueOnce(respond(401));
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(200, TOKENS));

      await expect(act(() => result.current.verifyCode('12345678'))).resolves.toEqual({ ok: true });

      expect(result.current.status).toBe('signed-in');
      expect(fetchMock).toHaveBeenLastCalledWith(
        API_PATHS.verify,
        expect.objectContaining({ body: JSON.stringify({ code: '12345678' }) }),
      );
      expect(localStorage).toHaveLength(0);
      expect(sessionStorage).toHaveLength(0);
      expect(document.cookie).toBe('');
    });

    it('returns next enter-code on 202 without signing in', async () => {
      fetchMock.mockResolvedValueOnce(respond(401));
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(202, { next: 'enter-code' }));

      await expect(act(() => result.current.verifyCode('123456'))).resolves.toEqual({
        ok: false,
        next: 'enter-code',
      });

      expect(result.current.status).toBe('signed-out');
    });

    it('returns the reason from an error response', async () => {
      fetchMock.mockResolvedValueOnce(respond(401));
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(400, { reason: 'bad-code' }));

      await expect(act(() => result.current.verifyCode('000000'))).resolves.toEqual({
        ok: false,
        reason: 'bad-code',
      });
    });
  });

  describe('recentCodeSignIn', () => {
    it('is true for a few minutes after an email-code sign-in, then expires', async () => {
      fetchMock.mockResolvedValueOnce(respond(401));
      const { result } = await renderSession();
      expect(result.current.recentCodeSignIn).toBe(false);
      fetchMock.mockResolvedValueOnce(respond(200, TOKENS));

      await act(() => result.current.verifyCode('123456'));
      expect(result.current.recentCodeSignIn).toBe(true);

      await advance(239_000);
      expect(result.current.recentCodeSignIn).toBe(true);
      await advance(2_000);
      expect(result.current.recentCodeSignIn).toBe(false);
    });

    it('is not set by a passkey sign-in or a refresh', async () => {
      const { result } = await renderSession();

      expect(result.current.recentCodeSignIn).toBe(false);
    });

    it('is cleared on sign-out', async () => {
      fetchMock.mockResolvedValueOnce(respond(401));
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(200, TOKENS));
      await act(() => result.current.verifyCode('123456'));
      fetchMock.mockResolvedValueOnce(respond(204));

      await act(() => result.current.signOut());

      expect(result.current.recentCodeSignIn).toBe(false);
    });
  });

  describe('startPasskeySignIn', () => {
    it('posts the email to the passkey start path', async () => {
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(200, { options: { challenge: 'abc' } }));

      await expect(
        act(() => result.current.startPasskeySignIn('jess@example.com')),
      ).resolves.toEqual({ ok: true, options: { challenge: 'abc' } });

      expect(fetchMock).toHaveBeenLastCalledWith(
        API_PATHS.passkeyStart,
        expect.objectContaining({ body: JSON.stringify({ email: 'jess@example.com' }) }),
      );
    });
  });

  describe('verifyPasskey', () => {
    const CREDENTIAL = {
      id: 'c',
      rawId: 'c',
      type: 'public-key' as const,
      response: { clientDataJSON: 'cd', authenticatorData: 'ad', signature: 's' },
      clientExtensionResults: {},
    };

    it('signs in without marking the sign-in as an email code', async () => {
      fetchMock.mockResolvedValueOnce(respond(401));
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(200, TOKENS));

      await expect(act(() => result.current.verifyPasskey(CREDENTIAL))).resolves.toEqual({
        ok: true,
      });

      expect(result.current.status).toBe('signed-in');
      expect(result.current.recentCodeSignIn).toBe(false);
      expect(fetchMock).toHaveBeenLastCalledWith(
        API_PATHS.passkeyVerify,
        expect.objectContaining({ body: JSON.stringify({ credential: CREDENTIAL }) }),
      );
    });

    it('returns the failure reason and stays signed out', async () => {
      fetchMock.mockResolvedValueOnce(respond(401));
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(400, { reason: 'passkey-failed' }));

      await expect(act(() => result.current.verifyPasskey(CREDENTIAL))).resolves.toEqual({
        ok: false,
        reason: 'passkey-failed',
      });

      expect(result.current.status).toBe('signed-out');
    });
  });

  describe('signOut', () => {
    it('revokes the session server-side and forgets the token', async () => {
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(204));

      await act(() => result.current.signOut());

      expect(fetchMock).toHaveBeenLastCalledWith(
        API_PATHS.signOut,
        expect.objectContaining({ method: 'POST', credentials: 'same-origin' }),
      );
      expect(result.current.status).toBe('signed-out');
    });

    it('signs out locally when the network fails', async () => {
      const { result } = await renderSession();
      fetchMock.mockRejectedValueOnce(new TypeError('offline'));

      await expect(act(() => result.current.signOut())).resolves.toBeUndefined();

      expect(result.current.status).toBe('signed-out');
    });

    it('waits for a refresh in flight before posting sign-out and stays signed out', async () => {
      const { result } = await renderSession();
      const release: ((response: Response) => void)[] = [];
      fetchMock
        .mockReturnValueOnce(new Promise<Response>((resolve) => release.push(resolve)))
        .mockResolvedValueOnce(respond(204));

      let flight: Promise<boolean> = Promise.resolve(true);
      let signingOut: Promise<void> = Promise.resolve();
      await act(async () => {
        flight = result.current.refresh();
        signingOut = result.current.signOut();
        await advance(0);
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);

      await act(async () => {
        release[0]?.(respond(200, { ...TOKENS, accessToken: 'token-2' }));
        await signingOut;
      });

      await expect(flight).resolves.toBe(false);
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(fetchMock).toHaveBeenLastCalledWith(
        API_PATHS.signOut,
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.current.status).toBe('signed-out');
    });
  });

  describe('apiFetch', () => {
    it('adds the bearer token', async () => {
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(200, {}));

      await act(() => result.current.apiFetch(endpoint(API_PATHS.me)));

      expect(headersOf(1).get('Authorization')).toBe('Bearer token-1');
      expect(headersOf(1).get('Content-Type')).toBe('application/json');
    });

    it('retries once after refreshing on 401', async () => {
      const { result } = await renderSession();
      fetchMock
        .mockResolvedValueOnce(respond(401))
        .mockResolvedValueOnce(respond(200, { ...TOKENS, accessToken: 'token-2' }))
        .mockResolvedValueOnce(respond(200, { ok: true }));

      const response = await act(() => result.current.apiFetch(endpoint(API_PATHS.me)));

      expect(response.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(4);
      expect(fetchMock.mock.calls[2]?.[0]).toBe(API_PATHS.refresh);
      expect(headersOf(3).get('Authorization')).toBe('Bearer token-2');
    });

    it('returns the second 401 without refreshing again', async () => {
      const { result } = await renderSession();
      fetchMock
        .mockResolvedValueOnce(respond(401))
        .mockResolvedValueOnce(respond(200, TOKENS))
        .mockResolvedValueOnce(respond(401));

      const response = await act(() => result.current.apiFetch(endpoint(API_PATHS.me)));

      expect(response.status).toBe(401);
      expect(fetchMock).toHaveBeenCalledTimes(4);
    });

    it('returns the 401 without retrying when the refresh fails', async () => {
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(401)).mockResolvedValueOnce(respond(401));

      const response = await act(() => result.current.apiFetch(endpoint(API_PATHS.me)));

      expect(response.status).toBe(401);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('does not refresh when signed out', async () => {
      fetchMock.mockResolvedValueOnce(respond(401));
      const { result } = await renderSession();
      fetchMock.mockResolvedValueOnce(respond(401));

      const response = await act(() => result.current.apiFetch(endpoint(API_PATHS.me)));

      expect(response.status).toBe(401);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('refuses paths outside the same-origin api', async () => {
      const { result } = await renderSession();
      fetchMock.mockClear();

      await expect(
        result.current.apiFetch(endpoint('https://evil.example/api/v1/me')),
      ).rejects.toThrow();
      await expect(result.current.apiFetch(endpoint('//evil.example/api/v1/me'))).rejects.toThrow();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  it('keeps the context value stable across rerenders', async () => {
    const { result, rerender } = await renderSession();
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
