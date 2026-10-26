import { sleep } from './index.ts';

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves once the time has passed', async () => {
    const done = vi.fn();
    const pending = sleep({ ms: 50 }).then(done);

    await vi.advanceTimersByTimeAsync(49);
    expect(done).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(done).toHaveBeenCalledOnce();
  });
});
