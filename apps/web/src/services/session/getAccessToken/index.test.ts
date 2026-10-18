const load = async () => {
  vi.resetModules();
  const { getAccessToken } = await import('./index');
  const { updateSession } = await import('../updateSession');
  return { getAccessToken, updateSession };
};

describe('getAccessToken', () => {
  it('returns undefined before sign-in and the stored token after', async () => {
    const { getAccessToken, updateSession } = await load();
    expect(getAccessToken()).toBeUndefined();

    updateSession({ accessToken: 'token-1' });

    expect(getAccessToken()).toBe('token-1');
  });
});
