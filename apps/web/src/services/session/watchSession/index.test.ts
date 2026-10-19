import type { ITokenResponse } from '@fridgeboard/contract/auth';

vi.mock('../../configuration', async () => {
  const { API_PATHS } = await import('@fridgeboard/contract/auth/constants');
  return { getServicePath: async (service: keyof typeof API_PATHS) => API_PATHS[service] };
});

const TOKENS: ITokenResponse = { accessToken: 'token-1', expiresIn: 900 };

const fetchMock = vi.fn<typeof fetch>();

const setVisibility = (state: DocumentVisibilityState): void => {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
};

const loadWatch = async () => {
  vi.resetModules();
  const { watchSession } = await import('./index');
  return watchSession;
};

describe('watchSession', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    fetchMock.mockReset();
    fetchMock.mockImplementation(async () => new Response(JSON.stringify(TOKENS), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    Reflect.deleteProperty(document, 'visibilityState');
  });

  it('refreshes on launch', async () => {
    const stop = (await loadWatch())();
    await vi.advanceTimersByTimeAsync(0);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    stop();
  });

  it('refreshes on visibilitychange to visible when the last refresh was over 60s ago', async () => {
    const stop = (await loadWatch())();
    await vi.advanceTimersByTimeAsync(30_000);

    setVisibility('visible');
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(31_000);
    setVisibility('visible');
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    stop();
  });

  it('ignores the page becoming hidden', async () => {
    const stop = (await loadWatch())();
    await vi.advanceTimersByTimeAsync(120_000);

    setVisibility('hidden');
    await vi.advanceTimersByTimeAsync(0);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    stop();
  });

  it('stops listening once stopped', async () => {
    const stop = (await loadWatch())();
    await vi.advanceTimersByTimeAsync(120_000);
    stop();

    setVisibility('visible');
    await vi.advanceTimersByTimeAsync(0);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
