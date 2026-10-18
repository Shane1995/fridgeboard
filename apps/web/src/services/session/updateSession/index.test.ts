const load = async () => {
  vi.resetModules();
  const { updateSession } = await import('./index');
  const { getSession } = await import('../getSession');
  const { subscribeSession } = await import('../subscribeSession');
  const { SessionStatus } = await import('../constants');
  return { updateSession, getSession, subscribeSession, SessionStatus };
};

describe('updateSession', () => {
  it('merges the patch into a new snapshot and notifies listeners', async () => {
    const { updateSession, getSession, subscribeSession, SessionStatus } = await load();
    const before = getSession();
    const listener = vi.fn();
    subscribeSession(listener);

    updateSession({ status: SessionStatus.SignedIn, accessToken: 'token-1' });

    expect(getSession()).toEqual({
      accessToken: 'token-1',
      status: 'signed-in',
      lastRefreshAt: undefined,
    });
    expect(getSession()).not.toBe(before);
    expect(before.status).toBe('loading');
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
