import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import type { CreateLiveSyncOptions } from '../../services/realtime/types';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { useLiveSyncConnection } from '.';

const createLiveSync = vi.hoisted(() => vi.fn());
const useListParams = vi.hoisted(() => vi.fn());
const useFetchChanges = vi.hoisted(() => vi.fn());
vi.mock('../../services/realtime/createLiveSync', () => ({ createLiveSync }));
vi.mock('../useListParams', () => ({ useListParams }));
vi.mock('../useFetchChanges', () => ({ useFetchChanges }));

const REALTIME = {
  httpHost: 'abc.appsync-api.eu-west-2.amazonaws.com',
  realtimeHost: 'abc.appsync-realtime-api.eu-west-2.amazonaws.com',
};

const configuration = ({ flag = true, realtime = true } = {}) => ({
  ...TEST_WEB_CONFIGURATION,
  featureFlags: { ...TEST_WEB_CONFIGURATION.featureFlags, [WebFeatureFlag.ENABLE_LIVE_SYNC]: flag },
  services: { ...TEST_WEB_CONFIGURATION.services, ...(realtime ? { realtime: REALTIME } : {}) },
});

const render = ({ config = configuration(), status = SessionStatus.SignedIn } = {}) => {
  const created = createSession(status);
  created.getToken.mockResolvedValue('token-1');
  const onChanges = vi.fn();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders session={created.session} client={new QueryClient()} config={config}>
      {children}
    </TestProviders>
  );
  return {
    ...created,
    onChanges,
    ...renderHook(() => useLiveSyncConnection({ onChanges }), { wrapper }),
  };
};

const options = (): CreateLiveSyncOptions => createLiveSync.mock.calls[0]?.[0];

describe('useLiveSyncConnection', () => {
  const liveSync = { start: vi.fn(), stop: vi.fn(), resume: vi.fn() };
  const fetchChanges = vi.fn();

  beforeEach(() => {
    createLiveSync.mockReset().mockReturnValue(liveSync);
    liveSync.start.mockReset();
    liveSync.stop.mockReset();
    liveSync.resume.mockReset();
    fetchChanges.mockReset();
    useFetchChanges.mockReset().mockReturnValue(fetchChanges);
    useListParams.mockReset().mockReturnValue({ householdId: 'hh-1' });
    Reflect.deleteProperty(document, 'visibilityState');
  });

  it('connects to the active household when everything it needs is there', () => {
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

  it('disconnects when it goes away', () => {
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

  it('passes what the server reports to onChanges and asks for missed changes through useFetchChanges', async () => {
    const { onChanges } = render();
    fetchChanges.mockResolvedValue({ rev: 3, changes: [] });

    options().onChanges([{ type: 'item', id: 'a' }]);
    const missed = await options().fetchChanges({ since: 2 });

    expect(onChanges).toHaveBeenCalledWith([{ type: 'item', id: 'a' }]);
    expect(fetchChanges).toHaveBeenCalledWith({ since: 2 });
    expect(missed).toEqual({ rev: 3, changes: [] });
  });
});
