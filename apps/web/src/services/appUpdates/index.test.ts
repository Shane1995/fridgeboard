import { registerSW } from 'virtual:pwa-register';
import { registerAppUpdates } from '.';

vi.mock('virtual:pwa-register', () => ({ registerSW: vi.fn() }));

const registration = () => ({ update: vi.fn(async () => undefined) });

describe('registerAppUpdates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(registerSW).mockReset();
  });

  afterEach(() => vi.useRealTimers());

  const register = () => {
    const updateSW = vi.fn();
    vi.mocked(registerSW).mockReturnValue(updateSW);
    registerAppUpdates();
    const options = vi.mocked(registerSW).mock.calls[0]?.[0];
    return { updateSW, options };
  };

  it('registers immediately', () => {
    const { options } = register();

    expect(options?.immediate).toBe(true);
  });

  it('reloads into the new version as soon as one is waiting', () => {
    const { updateSW, options } = register();

    options?.onNeedRefresh?.();

    expect(updateSW).toHaveBeenCalledWith(true);
  });

  it('checks for an update hourly', () => {
    const { options } = register();
    const current = registration();
    options?.onRegisteredSW?.('/sw.js', current as unknown as ServiceWorkerRegistration);

    vi.advanceTimersByTime(3_600_000 * 2);

    expect(current.update).toHaveBeenCalledTimes(2);
  });

  it('checks for an update when the app becomes visible again', () => {
    const { options } = register();
    const current = registration();
    options?.onRegisteredSW?.('/sw.js', current as unknown as ServiceWorkerRegistration);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');

    document.dispatchEvent(new Event('visibilitychange'));

    expect(current.update).toHaveBeenCalledTimes(1);
  });

  it('does not check while hidden', () => {
    const { options } = register();
    const current = registration();
    options?.onRegisteredSW?.('/sw.js', current as unknown as ServiceWorkerRegistration);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');

    document.dispatchEvent(new Event('visibilitychange'));

    expect(current.update).not.toHaveBeenCalled();
  });

  it('does nothing extra when there is no registration', () => {
    const { options } = register();

    expect(() => options?.onRegisteredSW?.('/sw.js', undefined)).not.toThrow();
  });
});
