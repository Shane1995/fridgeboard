import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RealtimeContext } from '../../Context/Realtime/context';
import { QueryName } from '../../services/configuration/schema/constants';
import type { SubscribeOptions } from '../../services/eventBus/createEventBus/types';
import type { ChangeEvent } from '../../services/realtime/types';
import { useInvalidateOnChange } from '.';

const TYPES = ['item'] as const;
const KEYS = [QueryName.items, QueryName.suggestions] as const;

describe('useInvalidateOnChange', () => {
  it('asks for the named queries to be refreshed when one of the kinds changes', () => {
    const subscribe = vi.fn(
      (_options: SubscribeOptions<'item' | 'shop', ChangeEvent>) => () => undefined,
    );
    const invalidate = vi.fn();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RealtimeContext.Provider value={{ subscribe, invalidate }}>
        {children}
      </RealtimeContext.Provider>
    );
    renderHook(() => useInvalidateOnChange({ types: TYPES, keys: KEYS }), { wrapper });
    expect(invalidate).not.toHaveBeenCalled();

    subscribe.mock.calls[0]?.[0].listener({ type: 'item', id: 'a' });

    expect(invalidate).toHaveBeenCalledWith({ keys: KEYS });
  });
});
