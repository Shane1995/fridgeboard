import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import type { CreateLiveSyncOptions } from '../../services/realtime/types';
import { SessionStatus } from '../../services/session/constants';
import { useRealtime } from '../../hooks/useRealtime';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { RealtimeProvider } from '.';

const createLiveSync = vi.hoisted(() => vi.fn());
const useListParams = vi.hoisted(() => vi.fn());
vi.mock('../../services/realtime/createLiveSync', () => ({ createLiveSync }));
vi.mock('../../hooks/useListParams', () => ({ useListParams }));

const REALTIME = {
  httpHost: 'abc.appsync-api.eu-west-2.amazonaws.com',
  realtimeHost: 'abc.appsync-realtime-api.eu-west-2.amazonaws.com',
};

const configuration = ({ flag = true, realtime = true } = {}) => ({
  ...TEST_WEB_CONFIGURATION,
  featureFlags: { ...TEST_WEB_CONFIGURATION.featureFlags, [WebFeatureFlag.ENABLE_LIVE_SYNC]: flag },
  services: { ...TEST_WEB_CONFIGURATION.services, ...(realtime ? { realtime: REALTIME } : {}) },
});

const render = ({
  config = configuration(),
  status = SessionStatus.SignedIn,
  client = new QueryClient(),
} = {}) => {
  const created = createSession(status);
  created.getToken.mockResolvedValue('token-1');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders session={created.session} client={client} config={config}>
      <RealtimeProvider>{children}</RealtimeProvider>
    </TestProviders>
  );
  return { ...created, ...renderHook(() => useRealtime(), { wrapper }) };
};

const options = (): CreateLiveSyncOptions => createLiveSync.mock.calls[0]?.[0];

describe('RealtimeProvider', () => {
  const liveSync = { start: vi.fn(), stop: vi.fn(), resume: vi.fn() };

  beforeEach(() => {
    createLiveSync.mockReset().mockReturnValue(liveSync);
    liveSync.start.mockReset();
    liveSync.stop.mockReset();
    liveSync.resume.mockReset();
    useListParams.mockReset().mockReturnValue({ householdId: 'hh-1' });
    Reflect.deleteProperty(document, 'visibilityState');
  });

  it('starts syncing the active household when everything it needs is there', () => {
    render();

    expect(options()).toMatchObject({ householdId: 'hh-1', ...REALTIME });
    expect(liveSync.start).toHaveBeenCalledOnce();
  });

  it.each([
    ['the flag is off', { config: configuration({ flag: false }) }],
    ['there is no realtime service', { config: configuration({ realtime: false }) }],
    ['the user is signed out', { status: SessionStatus.SignedOut }],
  ])('does nothing when %s', (_name, overrides) => {
    render(overrides);

    expect(createLiveSync).not.toHaveBeenCalled();
  });

  it('does nothing before the household is known', () => {
    useListParams.mockReturnValue({ householdId: undefined });

    render();

    expect(createLiveSync).not.toHaveBeenCalled();
  });

  it('stops when it goes away', () => {
    const { unmount } = render();

    unmount();

    expect(liveSync.stop).toHaveBeenCalledOnce();
  });

  it('asks for what it missed when the app returns to the foreground or the network comes back', () => {
    render();
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(liveSync.resume).not.toHaveBeenCalled();

    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('online'));

    expect(liveSync.resume).toHaveBeenCalledTimes(2);
  });

  it('gets its token from the session', async () => {
    const { getToken } = render();

    expect(await options().getToken()).toBe('token-1');
    expect(getToken).toHaveBeenCalledOnce();
  });

  it('tells each listener of a kind about the changes of that kind only', () => {
    const { result } = render();
    const items = vi.fn();
    const shops = vi.fn();
    result.current.subscribe({ topic: 'item', listener: items });
    result.current.subscribe({ topic: 'shop', listener: shops });

    options().onChanges([
      { type: 'item', id: 'a' },
      { type: 'shop', id: undefined },
    ]);

    expect(items).toHaveBeenCalledWith({ type: 'item', id: 'a' });
    expect(shops).toHaveBeenCalledWith({ type: 'shop', id: undefined });
    expect(items).toHaveBeenCalledTimes(1);
  });

  describe('refreshing lists', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('merges many requests for the same list into one refresh', () => {
      const client = new QueryClient();
      const spy = vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
      const { result } = render({ client });

      Array.from({ length: 17 }).forEach(() => result.current.invalidate({ keys: ['items'] }));
      result.current.invalidate({ keys: ['shops', 'items'] });
      expect(spy).not.toHaveBeenCalled();
      vi.advanceTimersByTime(150);

      expect(spy.mock.calls.map(([filters]) => filters?.queryKey)).toEqual([['items'], ['shops']]);
    });

    it('drops a pending refresh when it goes away', () => {
      const client = new QueryClient();
      const spy = vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
      const { result, unmount } = render({ client });

      result.current.invalidate({ keys: ['items'] });
      unmount();
      vi.advanceTimersByTime(500);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  it('asks the changes endpoint of the household, with the rev the app has seen', async () => {
    const { apiFetch } = render();
    apiFetch.mockImplementation(async () => new Response(JSON.stringify({ rev: 7, changes: [] })));

    const first = await options().fetchChanges({ since: undefined });
    const second = await options().fetchChanges({ since: 5 });

    expect(apiFetch.mock.calls.map(([endpoint]) => endpoint.path)).toEqual([
      '/api/v1/households/hh-1/changes',
      '/api/v1/households/hh-1/changes?since=5',
    ]);
    expect(first).toEqual({ rev: 7, changes: [] });
    expect(second).toEqual({ rev: 7, changes: [] });
  });

  it('fails the catch-up when the changes request fails', async () => {
    const { apiFetch } = render({
      config: {
        ...configuration(),
        queries: {
          ...TEST_WEB_CONFIGURATION.queries,
          default: { ...TEST_WEB_CONFIGURATION.queries.default, retry: 0 },
        },
      },
    });
    apiFetch.mockImplementation(async () => new Response('', { status: 500 }));

    await expect(options().fetchChanges({ since: 1 })).rejects.toThrow();
  });
});
