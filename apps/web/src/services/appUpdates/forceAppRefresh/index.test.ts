import { forceAppRefresh } from '.';

describe('forceAppRefresh', () => {
  const reload = vi.fn();
  const unregister = vi.fn(async () => true);
  const deleteCache = vi.fn(async () => true);

  beforeEach(() => {
    reload.mockReset();
    unregister.mockClear();
    deleteCache.mockClear();
    vi.stubGlobal('location', { reload });
    vi.stubGlobal('caches', {
      keys: async () => ['workbox-precache', 'runtime'],
      delete: deleteCache,
    });
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistrations: async () => [{ unregister }, { unregister }] },
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('unregisters every service worker and deletes every cache before reloading', async () => {
    await forceAppRefresh();

    expect(unregister).toHaveBeenCalledTimes(2);
    expect(deleteCache).toHaveBeenCalledWith('workbox-precache');
    expect(deleteCache).toHaveBeenCalledWith('runtime');
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('still reloads when clearing fails', async () => {
    vi.stubGlobal('caches', {
      keys: async () => {
        throw new Error('blocked');
      },
    });

    await expect(forceAppRefresh()).rejects.toThrow('blocked');
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
