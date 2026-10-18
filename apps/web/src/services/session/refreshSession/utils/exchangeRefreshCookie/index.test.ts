import type { ITokenResponse } from '@fridgeboard/contract/auth';

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

    await expect(exchangeRefreshCookie(onExpiring)).resolves.toBe(true);
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

    await exchangeRefreshCookie(onExpiring);
    await expect(exchangeRefreshCookie(onExpiring)).resolves.toBe(false);
    await vi.advanceTimersByTimeAsync(900_000);

    expect(getSession().status).toBe('signed-out');
    expect(onExpiring).not.toHaveBeenCalled();
  });
});
