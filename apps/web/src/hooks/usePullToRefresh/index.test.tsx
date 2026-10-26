import { act, fireEvent, renderHook } from '@testing-library/react';
import { TOUCH_DRAG_DELAY_MS } from '../../utils/touchDragListeners/constants';
import { usePullToRefresh } from './index';

const touch = (clientY: number) => ({ touches: [{ clientY }] });

const pull = ({
  target = document,
  from,
  to,
}: {
  target?: Element | Document;
  from: number;
  to: number;
}) => {
  fireEvent.touchStart(target, touch(from));
  fireEvent.touchMove(target, touch(to));
};

describe('usePullToRefresh', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  it('refreshes when pulled past the threshold from the top and released', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePullToRefresh({ onRefresh, enabled: true }));

    pull({ from: 0, to: 200 });
    expect(result.current.isReady).toBe(true);
    await act(async () => {
      fireEvent.touchEnd(document);
    });

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.distance).toBe(0);
  });

  it('shows it is refreshing until the refresh finishes', async () => {
    let finish = () => {};
    const onRefresh = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const { result } = renderHook(() => usePullToRefresh({ onRefresh, enabled: true }));

    pull({ from: 0, to: 200 });
    act(() => {
      fireEvent.touchEnd(document);
    });
    expect(result.current.isRefreshing).toBe(true);
    await act(async () => finish());

    expect(result.current.isRefreshing).toBe(false);
  });

  it('ignores a held touch, which is a drag rather than a pull', () => {
    vi.useFakeTimers();
    const onRefresh = vi.fn();
    const { result } = renderHook(() => usePullToRefresh({ onRefresh, enabled: true }));

    fireEvent.touchStart(document, touch(0));
    vi.advanceTimersByTime(TOUCH_DRAG_DELAY_MS + 50);
    fireEvent.touchMove(document, touch(200));
    vi.useRealTimers();

    expect(result.current.distance).toBe(0);
  });

  it('does nothing for a short pull', () => {
    const onRefresh = vi.fn();
    const { result } = renderHook(() => usePullToRefresh({ onRefresh, enabled: true }));

    pull({ from: 0, to: 60 });
    expect(result.current.isReady).toBe(false);
    act(() => {
      fireEvent.touchEnd(document);
    });

    expect(onRefresh).not.toHaveBeenCalled();
    expect(result.current.distance).toBe(0);
  });

  it('ignores a pull that starts when the page is scrolled down', () => {
    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
    const onRefresh = vi.fn();
    renderHook(() => usePullToRefresh({ onRefresh, enabled: true }));

    pull({ from: 0, to: 200 });
    fireEvent.touchEnd(document);

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('ignores a pull that starts inside a dialog', () => {
    const onRefresh = vi.fn();
    renderHook(() => usePullToRefresh({ onRefresh, enabled: true }));
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    document.body.append(dialog);

    pull({ target: dialog, from: 0, to: 200 });
    fireEvent.touchEnd(dialog);
    dialog.remove();

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('ignores an upward swipe', () => {
    const onRefresh = vi.fn();
    renderHook(() => usePullToRefresh({ onRefresh, enabled: true }));

    pull({ from: 300, to: 100 });
    fireEvent.touchEnd(document);

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('does nothing when disabled', () => {
    const onRefresh = vi.fn();
    renderHook(() => usePullToRefresh({ onRefresh, enabled: false }));

    pull({ from: 0, to: 200 });
    fireEvent.touchEnd(document);

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('stops the browser own pull to refresh while enabled and restores it after', () => {
    const { unmount } = renderHook(() => usePullToRefresh({ onRefresh: vi.fn(), enabled: true }));
    expect(document.documentElement.style.overscrollBehaviorY).toBe('contain');

    unmount();

    expect(document.documentElement.style.overscrollBehaviorY).toBe('');
  });
});
