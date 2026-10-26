import { createCoalescer } from '.';

describe('createCoalescer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('flushes everything added within the delay once, without repeats', () => {
    const flush = vi.fn();
    const coalescer = createCoalescer({ delayMs: 100, flush });

    Array.from({ length: 17 }).forEach(() => coalescer.add(['items']));
    coalescer.add(['shops', 'items']);
    vi.advanceTimersByTime(99);
    expect(flush).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(flush).toHaveBeenCalledOnce();
    expect(flush).toHaveBeenCalledWith(['items', 'shops']);
  });

  it('starts a new batch after a flush', () => {
    const flush = vi.fn();
    const coalescer = createCoalescer({ delayMs: 100, flush });

    coalescer.add(['items']);
    vi.advanceTimersByTime(100);
    coalescer.add(['items']);
    vi.advanceTimersByTime(100);

    expect(flush).toHaveBeenCalledTimes(2);
    expect(flush).toHaveBeenLastCalledWith(['items']);
  });

  it('drops what is waiting when cancelled', () => {
    const flush = vi.fn();
    const coalescer = createCoalescer({ delayMs: 100, flush });

    coalescer.add(['items']);
    coalescer.cancel();
    vi.advanceTimersByTime(500);

    expect(flush).not.toHaveBeenCalled();
  });
});
