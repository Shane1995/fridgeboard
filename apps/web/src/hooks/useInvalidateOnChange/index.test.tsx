import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RealtimeContext } from '../../Context/Realtime/context';
import { QueryName } from '../../services/configuration/schema/constants';
import type { SubscribeOptions } from '../../services/eventBus/createEventBus/types';
import type { ChangeEvent } from '../../services/realtime/types';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { useInvalidateOnChange } from '.';

const TYPES = ['item'] as const;
const KEYS = [QueryName.items, QueryName.suggestions] as const;

describe('useInvalidateOnChange', () => {
  it('marks the named queries stale when one of the kinds changes', () => {
    const client = new QueryClient();
    const spy = vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
    const subscribe = vi.fn(
      (_options: SubscribeOptions<'item' | 'shop', ChangeEvent>) => () => undefined,
    );
    const { session } = createSession(SessionStatus.SignedIn);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestProviders session={session} client={client}>
        <RealtimeContext.Provider value={{ subscribe }}>{children}</RealtimeContext.Provider>
      </TestProviders>
    );
    renderHook(() => useInvalidateOnChange({ types: TYPES, keys: KEYS }), { wrapper });
    expect(spy).not.toHaveBeenCalled();

    subscribe.mock.calls[0]?.[0].listener({ type: 'item', id: 'a' });

    expect(spy.mock.calls.map(([filters]) => filters?.queryKey)).toEqual([
      ['items'],
      ['suggestions'],
    ]);
  });
});
