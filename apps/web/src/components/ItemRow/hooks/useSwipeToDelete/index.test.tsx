import { act, renderHook } from '@testing-library/react';
import { SWIPE_DELETE_THRESHOLD_PX } from './constants';
import { useSwipeToDelete } from './index';

const pointer = (x: number, y = 0) =>
  ({
    pointerId: 1,
    clientX: x,
    clientY: y,
    currentTarget: { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() },
  }) as never;

const setUp = (enabled = true) => {
  const onDelete = vi.fn();
  const { result } = renderHook(() => useSwipeToDelete({ onDelete, enabled }));
  return { onDelete, result };
};

const swipe = ({
  result,
  from = 200,
  to,
  y = 0,
}: {
  result: ReturnType<typeof setUp>['result'];
  from?: number;
  to: number;
  y?: number;
}) => {
  act(() => result.current.handlers.onPointerDown(pointer(from)));
  act(() => result.current.handlers.onPointerMove(pointer(to, y)));
};

describe('useSwipeToDelete', () => {
  it('deletes once when swiped left past the threshold and released', () => {
    const { onDelete, result } = setUp();

    swipe({ result, to: 200 - SWIPE_DELETE_THRESHOLD_PX - 24 });
    act(() => result.current.handlers.onPointerUp(pointer(0)));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(result.current.offset).toBe(0);
  });

  it('follows the finger and arms the delete once past the threshold', () => {
    const { result } = setUp();

    swipe({ result, to: 140 });
    expect(result.current.offset).toBe(-60);
    expect(result.current.isSwiping).toBe(true);
    expect(result.current.isArmed).toBe(false);

    act(() => result.current.handlers.onPointerMove(pointer(200 - SWIPE_DELETE_THRESHOLD_PX - 1)));
    expect(result.current.isArmed).toBe(true);
  });

  it('snaps back and deletes nothing when released before the threshold', () => {
    const { onDelete, result } = setUp();

    swipe({ result, to: 140 });
    act(() => result.current.handlers.onPointerUp(pointer(0)));

    expect(onDelete).not.toHaveBeenCalled();
    expect(result.current.offset).toBe(0);
    expect(result.current.isSwiping).toBe(false);
  });

  it('ignores mostly vertical movement so the page can scroll', () => {
    const { onDelete, result } = setUp();

    swipe({ result, to: 190, y: 60 });
    act(() => result.current.handlers.onPointerUp(pointer(0)));

    expect(result.current.isSwiping).toBe(false);
    expect(result.current.offset).toBe(0);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('never moves to the right', () => {
    const { result } = setUp();

    swipe({ result, to: 320 });

    expect(result.current.offset).toBe(0);
  });

  it('does nothing when disabled', () => {
    const { onDelete, result } = setUp(false);

    swipe({ result, to: 0 });
    act(() => result.current.handlers.onPointerUp(pointer(0)));

    expect(result.current.isSwiping).toBe(false);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('resets when the gesture is cancelled', () => {
    const { onDelete, result } = setUp();

    swipe({ result, to: 0 });
    act(() => result.current.handlers.onPointerCancel(pointer(0)));

    expect(result.current.offset).toBe(0);
    expect(result.current.isSwiping).toBe(false);
    expect(onDelete).not.toHaveBeenCalled();
  });
});
