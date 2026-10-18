const load = async () => {
  vi.resetModules();
  const { getSessionStatus } = await import('./index');
  const { updateSession } = await import('../updateSession');
  const { SessionStatus } = await import('../constants');
  return { getSessionStatus, updateSession, SessionStatus };
};

describe('getSessionStatus', () => {
  it('returns the current status', async () => {
    const { getSessionStatus, updateSession, SessionStatus } = await load();
    expect(getSessionStatus()).toBe('loading');

    updateSession({ status: SessionStatus.SignedIn });

    expect(getSessionStatus()).toBe('signed-in');
  });
});
