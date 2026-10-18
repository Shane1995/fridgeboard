const load = async () => {
  vi.resetModules();
  const { bumpEpoch } = await import('./index');
  const { getEpoch } = await import('../getEpoch');
  return { bumpEpoch, getEpoch };
};

describe('bumpEpoch', () => {
  it('increments the epoch from zero', async () => {
    const { bumpEpoch, getEpoch } = await load();
    expect(getEpoch()).toBe(0);

    bumpEpoch();
    bumpEpoch();

    expect(getEpoch()).toBe(2);
  });
});
