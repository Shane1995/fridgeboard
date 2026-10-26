import { renderHook } from '@testing-library/react';
import { useRealtime } from '.';

describe('useRealtime', () => {
  it('quietly does nothing when there is no provider, such as in a signed-out screen', () => {
    const { result } = renderHook(() => useRealtime());
    const listener = vi.fn();

    const unsubscribe = result.current.subscribe({ topic: 'item', listener });
    unsubscribe();

    expect(listener).not.toHaveBeenCalled();
  });
});
