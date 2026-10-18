import { scheduleRefresh } from './index';

describe('scheduleRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs after the delay and replaces any earlier schedule', () => {
    const first = vi.fn(async () => true);
    const second = vi.fn(async () => true);

    scheduleRefresh(1_000, first);
    scheduleRefresh(2_000, second);
    vi.advanceTimersByTime(2_000);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
