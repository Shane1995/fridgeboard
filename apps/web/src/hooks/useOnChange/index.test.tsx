import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RealtimeContext } from '../../Context/Realtime/context';
import type { SubscribeOptions } from '../../services/eventBus/createEventBus/types';
import type { ChangeEvent } from '../../services/realtime/types';
import { useOnChange } from '.';

const TYPES = ['item', 'shop'] as const;

const setup = () => {
  const unsubscribe = vi.fn();
  const subscribe = vi.fn(
    (_options: SubscribeOptions<'item' | 'shop', ChangeEvent>) => unsubscribe,
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <RealtimeContext.Provider value={{ subscribe }}>{children}</RealtimeContext.Provider>
  );
  return { subscribe, unsubscribe, wrapper };
};

describe('useOnChange', () => {
  it('listens for each kind it is given and stops when it goes away', () => {
    const { subscribe, unsubscribe, wrapper } = setup();

    const { unmount } = renderHook(() => useOnChange({ types: TYPES, onChange: vi.fn() }), {
      wrapper,
    });

    expect(subscribe.mock.calls.map(([{ topic }]) => topic)).toEqual(['item', 'shop']);
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(2);
  });

  it('calls the latest handler without listening again', () => {
    const { subscribe, wrapper } = setup();
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ handler }) => useOnChange({ types: TYPES, onChange: handler }),
      { wrapper, initialProps: { handler: first } },
    );

    rerender({ handler: second });
    subscribe.mock.calls[0]?.[0].listener({ type: 'item', id: 'a' });

    expect(subscribe).toHaveBeenCalledTimes(2);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith({ type: 'item', id: 'a' });
  });
});
