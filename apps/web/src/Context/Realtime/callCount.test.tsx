import { QueryClient } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { useItemsQuery } from '../../hooks/useItemsQuery';
import { useShopsQuery } from '../../hooks/useShopsQuery';
import type { UseLiveSyncConnectionOptions } from '../../hooks/useLiveSyncConnection/types';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { RealtimeProvider } from '.';

const useLiveSyncConnection = vi.hoisted(() => vi.fn());
const useListParams = vi.hoisted(() => vi.fn());
vi.mock('../../hooks/useLiveSyncConnection', () => ({ useLiveSyncConnection }));
vi.mock('../../hooks/useListParams', () => ({ useListParams }));

const ITEMS = Array.from({ length: 17 }, (_, index) => ({
  id: `i${index}`,
  name: `Item ${index}`,
  shopIds: [],
  checked: false,
  createdAt: 1,
  addedBy: 'sub-1',
}));

const Rows = () => {
  ITEMS.forEach(() => useItemsQuery());
  useShopsQuery();
  useShopsQuery();
  return null;
};

const setup = () => {
  const created = createSession(SessionStatus.SignedIn);
  created.apiFetch.mockImplementation(async (endpoint: { path: string }) =>
    endpoint.path.endsWith('/shops')
      ? new Response(JSON.stringify({ shops: [] }))
      : new Response(JSON.stringify({ items: ITEMS })),
  );
  const config = {
    ...TEST_WEB_CONFIGURATION,
    featureFlags: {
      ...TEST_WEB_CONFIGURATION.featureFlags,
      [WebFeatureFlag.ENABLE_LIVE_SYNC]: true,
    },
  };
  render(
    <TestProviders session={created.session} client={new QueryClient()} config={config}>
      <RealtimeProvider>
        <Rows />
      </RealtimeProvider>
    </TestProviders>,
  );
  const connection = (): UseLiveSyncConnectionOptions => useLiveSyncConnection.mock.calls[0]?.[0];
  const calls = () =>
    created.apiFetch.mock.calls.map(([endpoint]) => endpoint.path.split('/').pop());
  const settle = () => act(() => vi.advanceTimersByTimeAsync(300));
  return { connection, calls, settle, apiFetch: created.apiFetch };
};

describe('calls made with live sync on, 17 rows and 2 shop readers on screen', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    useLiveSyncConnection.mockReset();
    useListParams.mockReset().mockReturnValue({
      householdId: 'hh-1',
      listId: 'main',
      paramsFor: (extra = {}) => ({ householdId: 'hh-1', listId: 'main', ...extra }),
      queryKeyFor: (name: string) => [name, { householdId: 'hh-1', listId: 'main' }],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the items once and the shops once, however many components read them', async () => {
    const { calls, settle } = setup();

    await settle();

    expect(calls().sort()).toEqual(['items', 'shops']);
  });

  it('refreshes the items once for a burst of item changes, and leaves the shops alone', async () => {
    const { calls, settle, connection, apiFetch } = setup();
    await settle();
    apiFetch.mockClear();

    connection().onChanges(
      Array.from({ length: 10 }, (_, index) => ({ type: 'item' as const, id: `i${index}` })),
    );
    await settle();

    expect(calls()).toEqual(['items']);
  });

  it('refreshes each list once when a shop changes', async () => {
    const { calls, settle, connection, apiFetch } = setup();
    await settle();
    apiFetch.mockClear();

    connection().onChanges([{ type: 'shop', id: 's1' }]);
    await settle();

    expect(calls().sort()).toEqual(['items', 'shops']);
  });

  it('refreshes each list once after catching up from being offline', async () => {
    const { calls, settle, connection, apiFetch } = setup();
    await settle();
    apiFetch.mockClear();

    connection().onChanges([
      { type: 'item', id: undefined },
      { type: 'shop', id: undefined },
    ]);
    await settle();

    expect(calls().sort()).toEqual(['items', 'shops']);
  });

  it('makes no calls when nothing changes', async () => {
    const { calls, settle, apiFetch } = setup();
    await settle();
    apiFetch.mockClear();

    await settle();

    expect(calls()).toEqual([]);
  });
});
