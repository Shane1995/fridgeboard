import type { ITokenResponse } from '@fridgeboard/contract/auth';

const load = async () => {
  vi.resetModules();
  const { applyTokens } = await import('./index');
  const { getSession } = await import('../getSession');
  const { getEpoch } = await import('../getEpoch');
  return { applyTokens, getSession, getEpoch };
};

describe('applyTokens', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: 1_000_000 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('signs in, stamps the refresh time, starts a new epoch and schedules 60s before expiry', async () => {
    const { applyTokens, getSession, getEpoch } = await load();
    const onExpiring = vi.fn(async () => true);
    const tokens: ITokenResponse = { accessToken: 'token-1', expiresIn: 900 };

    applyTokens(tokens, onExpiring);

    expect(getSession()).toEqual({
      accessToken: 'token-1',
      status: 'signed-in',
      lastRefreshAt: 1_000_000,
    });
    expect(getEpoch()).toBe(1);
    vi.advanceTimersByTime(839_999);
    expect(onExpiring).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onExpiring).toHaveBeenCalledTimes(1);
  });

  it('refreshes immediately when the token expires within the lead time', async () => {
    const { applyTokens } = await load();
    const onExpiring = vi.fn(async () => true);

    applyTokens({ accessToken: 'token-1', expiresIn: 30 }, onExpiring);
    vi.advanceTimersByTime(0);

    expect(onExpiring).toHaveBeenCalledTimes(1);
  });

  it('uses the configured refresh lead', async () => {
    const { applyTokens } = await load();
    const { setConfiguration } = await import('../../configuration/setConfiguration');
    const { DEFAULT_WEB_CONFIGURATION } =
      await import('@fridgeboard/contract/configuration/web/constants');
    setConfiguration({
      ...DEFAULT_WEB_CONFIGURATION,
      settings: { ...DEFAULT_WEB_CONFIGURATION.settings, refreshLeadMs: 300_000 },
    });
    const onExpiring = vi.fn(async () => true);

    applyTokens({ accessToken: 'token-1', expiresIn: 900 }, onExpiring);
    vi.advanceTimersByTime(599_999);
    expect(onExpiring).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(onExpiring).toHaveBeenCalledTimes(1);
  });
});
