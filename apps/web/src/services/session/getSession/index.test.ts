const load = async () => {
  vi.resetModules();
  const { getSession } = await import('./index');
  const { updateSession } = await import('../updateSession');
  const { SessionStatus } = await import('../constants');
  return { getSession, updateSession, SessionStatus };
};

describe('getSession', () => {
  it('starts loading with no token', async () => {
    const { getSession } = await load();

    expect(getSession()).toEqual({
      accessToken: undefined,
      status: 'loading',
      lastRefreshAt: undefined,
    });
  });

  it('returns the latest snapshot', async () => {
    const { getSession, updateSession, SessionStatus } = await load();

    updateSession({ status: SessionStatus.SignedOut, lastRefreshAt: 5 });

    expect(getSession()).toEqual({
      accessToken: undefined,
      status: 'signed-out',
      lastRefreshAt: 5,
    });
  });
});
