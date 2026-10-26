import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useRealtime } from '../../hooks/useRealtime';
import type { UseLiveSyncConnectionOptions } from '../../hooks/useLiveSyncConnection/types';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { RealtimeProvider } from '.';

const useLiveSyncConnection = vi.hoisted(() => vi.fn());
vi.mock('../../hooks/useLiveSyncConnection', () => ({ useLiveSyncConnection }));

const render = (client = new QueryClient()) => {
  const { session } = createSession(SessionStatus.SignedIn);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders session={session} client={client}>
      <RealtimeProvider>{children}</RealtimeProvider>
    </TestProviders>
  );
  return renderHook(() => useRealtime(), { wrapper });
};

const connection = (): UseLiveSyncConnectionOptions => useLiveSyncConnection.mock.calls[0]?.[0];

describe('RealtimeProvider', () => {
  beforeEach(() => {
    useLiveSyncConnection.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hands what the connection reports to whoever listens for that kind', () => {
    const { result } = render();
    const items = vi.fn();
    const shops = vi.fn();
    result.current.subscribe({ topic: 'item', listener: items });
    result.current.subscribe({ topic: 'shop', listener: shops });

    connection().onChanges([{ type: 'item', id: 'a' }]);

    expect(items).toHaveBeenCalledWith({ type: 'item', id: 'a' });
    expect(shops).not.toHaveBeenCalled();
  });

  it('refreshes a list once after a burst of changes to its kind', () => {
    const client = new QueryClient();
    const spy = vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
    const { result } = render(client);
    result.current.invalidateOn({ types: ['item'], keys: ['items'] });

    connection().onChanges([
      { type: 'item', id: 'a' },
      { type: 'item', id: 'b' },
    ]);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(150);

    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith({ queryKey: ['items'] });
  });

  it('drops a refresh that is waiting when it goes away', () => {
    const client = new QueryClient();
    const spy = vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
    const { result, unmount } = render(client);
    result.current.invalidateOn({ types: ['item'], keys: ['items'] });

    connection().onChanges([{ type: 'item', id: 'a' }]);
    unmount();
    vi.advanceTimersByTime(500);

    expect(spy).not.toHaveBeenCalled();
  });
});
