import type { ITokenResponse } from '@fridgeboard/contract/auth';

const TOKENS: ITokenResponse = { accessToken: 'token-1', expiresIn: 900 };

const load = async () => {
  vi.resetModules();
  const { clearSession } = await import('./index');
  const { applyTokens } = await import('../applyTokens');
  const { getSession } = await import('../getSession');
  const { getEpoch } = await import('../getEpoch');
  const { queryClient } = await import('../../queryClient');
  return { clearSession, applyTokens, getSession, getEpoch, queryClient };
};

describe('clearSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('drops the token, cached data and scheduled refresh, and starts a new epoch', async () => {
    const { clearSession, applyTokens, getSession, getEpoch, queryClient } = await load();
    const onExpiring = vi.fn(async () => true);
    applyTokens(TOKENS, onExpiring);
    queryClient.setQueryData(['me'], { email: 'jess@example.com' });
    const epoch = getEpoch();

    clearSession();
    vi.advanceTimersByTime(900_000);

    expect(getSession()).toMatchObject({ accessToken: undefined, status: 'signed-out' });
    expect(queryClient.getQueryData(['me'])).toBeUndefined();
    expect(onExpiring).not.toHaveBeenCalled();
    expect(getEpoch()).toBe(epoch + 1);
  });
});
