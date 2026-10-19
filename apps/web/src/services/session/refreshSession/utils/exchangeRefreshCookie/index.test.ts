import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import type { SessionConfig } from '../../../types';
import type { ITokenResponse } from '@fridgeboard/contract/auth';

const CONFIG: SessionConfig = {
  refreshPath: API_PATHS.refresh,
  refreshLeadMs: 60_000,
  refreshMinIntervalMs: 60_000,
};

const TOKENS: ITokenResponse = { accessToken: 'token-1', expiresIn: 900 };

const fetchMock = vi.fn<typeof fetch>();

const load = async () => {
  vi.resetModules();
  const { exchangeRefreshCookie } = await import('./index');
  const { getSession } = await import('../../../getSession');
  return { exchangeRefreshCookie, getSession };
};

describe('exchangeRefreshCookie', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('stores the new token and schedules the next refresh', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(TOKENS), { status: 200 }));
    const onExpiring = vi.fn(async () => true);
    const { exchangeRefreshCookie, getSession } = await load();

    await expect(exchangeRefreshCookie(CONFIG, onExpiring)).resolves.toBe(true);
    expect(getSession()).toMatchObject({ accessToken: 'token-1', status: 'signed-in' });

    await vi.advanceTimersByTimeAsync(840_000);
    expect(onExpiring).toHaveBeenCalledTimes(1);
  });

  it('signs out on 401 and cancels the scheduled refresh', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify(TOKENS), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }));
    const onExpiring = vi.fn(async () => true);
    const { exchangeRefreshCookie, getSession } = await load();

    await exchangeRefreshCookie(CONFIG, onExpiring);
    await expect(exchangeRefreshCookie(CONFIG, onExpiring)).resolves.toBe(false);
    await vi.advanceTimersByTimeAsync(900_000);

    expect(getSession().status).toBe('signed-out');
    expect(onExpiring).not.toHaveBeenCalled();
  });

  it('signs out without rejecting when a 200 body is malformed, and a later refresh proceeds', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify(TOKENS), { status: 200 }))
      .mockResolvedValueOnce(new Response('not json', { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ accessToken: 'x' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(TOKENS), { status: 200 }));
    const onExpiring = vi.fn(async () => true);
    const { exchangeRefreshCookie, getSession } = await load();

    await exchangeRefreshCookie(CONFIG, onExpiring);
    await expect(exchangeRefreshCookie(CONFIG, onExpiring)).resolves.toBe(false);
    expect(getSession()).toMatchObject({ accessToken: undefined, status: 'signed-out' });

    await expect(exchangeRefreshCookie(CONFIG, onExpiring)).resolves.toBe(false);
    expect(getSession().accessToken).toBeUndefined();

    await expect(exchangeRefreshCookie(CONFIG, onExpiring)).resolves.toBe(true);
    expect(getSession()).toMatchObject({ accessToken: 'token-1', status: 'signed-in' });
  });

  it('drops a result that lands after the session was cleared', async () => {
    const release: ((response: Response) => void)[] = [];
    const pending = new Promise<Response>((resolve) => release.push(resolve));
    fetchMock.mockReturnValueOnce(pending);
    const onExpiring = vi.fn(async () => true);
    const { exchangeRefreshCookie, getSession } = await load();
    const { clearSession } = await import('../../../clearSession');

    const flight = exchangeRefreshCookie(CONFIG, onExpiring);
    clearSession();
    release[0]?.(new Response(JSON.stringify(TOKENS), { status: 200 }));

    await expect(flight).resolves.toBe(false);
    expect(getSession()).toMatchObject({ accessToken: undefined, status: 'signed-out' });
    await vi.advanceTimersByTimeAsync(900_000);
    expect(onExpiring).not.toHaveBeenCalled();
  });
});
