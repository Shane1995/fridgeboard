const load = async () => {
  vi.resetModules();
  const { updateSession } = await import('./index');
  const { getSession } = await import('../getSession');
  const { SessionStatus } = await import('../constants');
  return { updateSession, getSession, SessionStatus };
};

describe('updateSession', () => {
  it('merges the patch into a new snapshot', async () => {
    const { updateSession, getSession, SessionStatus } = await load();
    const before = getSession();

    updateSession({ status: SessionStatus.SignedIn, accessToken: 'token-1' });

    expect(getSession()).toEqual({
      accessToken: 'token-1',
      status: 'signed-in',
      lastRefreshAt: undefined,
    });
    expect(getSession()).not.toBe(before);
    expect(before.status).toBe('loading');
  });
});
