import { renderHook } from '@testing-library/react';
import { useLatest } from '.';

describe('useLatest', () => {
  it('keeps one ref whose value follows the newest render', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 1 },
    });
    const holder = result.current;
    expect(holder.current).toBe(1);

    rerender({ value: 2 });

    expect(result.current).toBe(holder);
    expect(holder.current).toBe(2);
  });
});
