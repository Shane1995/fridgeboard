import type { ITokenResponse } from '@fridgeboard/contract/auth';
import { API_PATHS } from '@fridgeboard/contract/auth/constants';

vi.mock('../../configuration', async () => {
  const { API_PATHS } = await import('@fridgeboard/contract/auth/constants');
  return { getServicePath: async (service: keyof typeof API_PATHS) => API_PATHS[service] };
});

const TOKENS: ITokenResponse = { accessToken: 'token-1', expiresIn: 900 };

const respond = (status: number, body?: unknown): Response =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

const fetchMock = vi.fn<typeof fetch>();

const loadSession = async () => {
  vi.resetModules();
  const { refreshSession } = await import('./index');
  const { getAccessToken } = await import('../getAccessToken');
  const { getSessionStatus } = await import('../getSessionStatus');
  return { refreshSession, getAccessToken, getSessionStatus };
};

describe('refreshSession', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    Reflect.deleteProperty(navigator, 'locks');
  });

  it('sends one request when called three times concurrently', async () => {
    fetchMock.mockResolvedValue(respond(200, TOKENS));
    const { refreshSession } = await loadSession();

    const results = await Promise.all([refreshSession(), refreshSession(), refreshSession()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(results).toEqual([true, true, true]);
  });

  it('posts to the refresh path with same-origin credentials and a JSON content type', async () => {
    fetchMock.mockResolvedValue(respond(200, TOKENS));
    const { refreshSession, getAccessToken, getSessionStatus } = await loadSession();

    await refreshSession();

    expect(fetchMock).toHaveBeenCalledWith(
      API_PATHS.refresh,
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(getAccessToken()).toBe('token-1');
    expect(getSessionStatus()).toBe('signed-in');
  });

  it('resolves false and clears the token on 401', async () => {
    fetchMock
      .mockResolvedValueOnce(respond(200, TOKENS))
      .mockResolvedValueOnce(respond(401, { reason: 'unauthorised' }));
    const { refreshSession, getAccessToken, getSessionStatus } = await loadSession();

    await refreshSession();
    const result = await refreshSession();

    expect(result).toBe(false);
    expect(getAccessToken()).toBeUndefined();
    expect(getSessionStatus()).toBe('signed-out');
  });

  it('schedules a refresh 60s before expiry', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    fetchMock.mockImplementation(async () => respond(200, TOKENS));
    const { refreshSession } = await loadSession();

    await refreshSession();
    await vi.advanceTimersByTimeAsync(839_999);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('runs inside the fb-refresh web lock when available', async () => {
    const request = vi.fn((_name: string, callback: () => Promise<boolean>) => callback());
    Object.defineProperty(navigator, 'locks', { value: { request }, configurable: true });
    fetchMock.mockResolvedValue(respond(200, TOKENS));
    const { refreshSession } = await loadSession();

    await expect(refreshSession()).resolves.toBe(true);

    expect(request).toHaveBeenCalledWith('fb-refresh', expect.any(Function));
  });

  it('keeps the token when the refresh fails with a server error', async () => {
    fetchMock.mockResolvedValueOnce(respond(200, TOKENS)).mockResolvedValueOnce(respond(500));
    const { refreshSession, getAccessToken, getSessionStatus } = await loadSession();

    await refreshSession();
    const result = await refreshSession();

    expect(result).toBe(true);
    expect(getAccessToken()).toBe('token-1');
    expect(getSessionStatus()).toBe('signed-in');
  });

  it('resolves false and marks the session signed out when the network fails at launch', async () => {
    fetchMock.mockRejectedValue(new TypeError('offline'));
    const { refreshSession, getSessionStatus } = await loadSession();

    await expect(refreshSession()).resolves.toBe(false);

    expect(getSessionStatus()).toBe('signed-out');
  });

  it('sends a new request once the previous one has settled', async () => {
    fetchMock.mockImplementation(async () => respond(200, TOKENS));
    const { refreshSession } = await loadSession();

    await refreshSession();
    await refreshSession();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('resolves false instead of rejecting when the 200 body is malformed', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{', { status: 200 }));
    const { refreshSession, getAccessToken, getSessionStatus } = await loadSession();

    await expect(refreshSession()).resolves.toBe(false);
    expect(getAccessToken()).toBeUndefined();
    expect(getSessionStatus()).toBe('signed-out');
  });
});
