import type { SessionConfig } from '../types';
import type { ITokenResponse } from '@fridgeboard/contract/auth';

const CONFIG: SessionConfig = {
  refreshPath: '/api/v1/auth/refresh',
  refreshLeadMs: 60_000,
  refreshMinIntervalMs: 60_000,
};

const TOKENS: ITokenResponse = { accessToken: 'token-1', expiresIn: 900 };

const load = async () => {
  vi.resetModules();
  const { clearSession } = await import('./index');
  const { applyTokens } = await import('../applyTokens');
  const { getSession } = await import('../getSession');
  const { getEpoch } = await import('../getEpoch');
  return { clearSession, applyTokens, getSession, getEpoch };
};

describe('clearSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('drops the token and scheduled refresh, and starts a new epoch', async () => {
    const { clearSession, applyTokens, getSession, getEpoch } = await load();
    const onExpiring = vi.fn(async () => true);
    applyTokens(TOKENS, CONFIG, onExpiring);
    const epoch = getEpoch();

    clearSession();
    vi.advanceTimersByTime(900_000);

    expect(getSession()).toMatchObject({ accessToken: undefined, status: 'signed-out' });
    expect(onExpiring).not.toHaveBeenCalled();
    expect(getEpoch()).toBe(epoch + 1);
  });
});
