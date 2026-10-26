import { nextBackoff } from '.';

describe('nextBackoff', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('doubles the wait with each attempt, between half and all of the ceiling', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect([0, 1, 2, 3].map((attempt) => nextBackoff({ attempt }))).toEqual([
      500, 1000, 2000, 4000,
    ]);

    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    expect([0, 1, 2, 3].map((attempt) => nextBackoff({ attempt }))).toEqual([
      999, 1999, 3998, 7996,
    ]);
  });

  it('stops growing at 30 seconds', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);

    expect(nextBackoff({ attempt: 10 })).toBeLessThanOrEqual(30_000);
    expect(nextBackoff({ attempt: 10 })).toBeGreaterThanOrEqual(15_000);
    expect(nextBackoff({ attempt: 50 })).toBeLessThanOrEqual(30_000);
  });
});
