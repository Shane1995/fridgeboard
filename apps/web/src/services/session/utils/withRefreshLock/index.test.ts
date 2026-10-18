import { withRefreshLock } from './index';

describe('withRefreshLock', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'locks');
  });

  it('runs directly when the Web Locks API is missing', async () => {
    await expect(withRefreshLock(async () => true)).resolves.toBe(true);
  });

  it('holds the fb-refresh lock while running', async () => {
    const request = vi.fn((_name: string, callback: () => Promise<boolean>) => callback());
    Object.defineProperty(navigator, 'locks', { value: { request }, configurable: true });

    await expect(withRefreshLock(async () => false)).resolves.toBe(false);
    expect(request).toHaveBeenCalledWith('fb-refresh', expect.any(Function));
  });
});
