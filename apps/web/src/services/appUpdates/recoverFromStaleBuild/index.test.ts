import { STALE_BUILD_CHECK_KEY } from './constants';
import { recoverFromStaleBuild } from './index';

const withRegistration = (update: () => Promise<void>) =>
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { getRegistration: async () => ({ update }) },
  });

describe('recoverFromStaleBuild', () => {
  beforeEach(() => sessionStorage.clear());

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'serviceWorker');
    vi.restoreAllMocks();
  });

  it('asks the service worker for a newer build', async () => {
    const update = vi.fn(async () => undefined);
    withRegistration(update);

    await recoverFromStaleBuild();

    expect(update).toHaveBeenCalledTimes(1);
  });

  it('only checks once per session', async () => {
    const update = vi.fn(async () => undefined);
    withRegistration(update);

    await recoverFromStaleBuild();
    await recoverFromStaleBuild();

    expect(update).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(STALE_BUILD_CHECK_KEY)).not.toBeNull();
  });

  it('does nothing when there is no service worker', async () => {
    await expect(recoverFromStaleBuild()).resolves.toBeUndefined();
  });

  it('survives storage or the update failing', async () => {
    withRegistration(async () => {
      throw new Error('offline');
    });
    await expect(recoverFromStaleBuild()).resolves.toBeUndefined();

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    await expect(recoverFromStaleBuild()).resolves.toBeUndefined();
  });
});
