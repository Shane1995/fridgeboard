import { retryDelay } from './index.ts';

describe('retryDelay', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is a random wait that can grow with each attempt', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect([1, 2, 5].map((attempt) => retryDelay({ attempt }))).toEqual([10, 20, 50]);
  });

  it('never waits a negative or fractional time', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);

    expect(retryDelay({ attempt: 3 })).toBe(59);
    expect(retryDelay({ attempt: 1 })).toBeGreaterThanOrEqual(0);
  });
});
