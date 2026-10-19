const load = async () => {
  vi.resetModules();
  const { subscribeSession } = await import('./index');
  const { updateSession } = await import('../updateSession');
  return { subscribeSession, updateSession };
};

describe('subscribeSession', () => {
  it('notifies listeners with the new snapshot until unsubscribed', async () => {
    const { subscribeSession, updateSession } = await load();
    const listener = vi.fn();
    const unsubscribe = subscribeSession(listener);

    updateSession({ accessToken: 'token-1' });
    unsubscribe();
    updateSession({ accessToken: 'token-2' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ accessToken: 'token-1' }));
  });
});
