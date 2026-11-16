import { toLondonDate } from './index.ts';

describe('toLondonDate', () => {
  it.each([
    ['2026-07-01T23:30:00Z', '2026-07-02'],
    ['2026-01-01T23:30:00Z', '2026-01-01'],
    ['2026-10-25T00:30:00Z', '2026-10-25'],
    ['2026-10-25T23:30:00Z', '2026-10-25'],
    ['2026-10-26T00:30:00Z', '2026-10-26'],
    ['2026-03-29T00:30:00Z', '2026-03-29'],
    ['2026-03-29T23:30:00Z', '2026-03-30'],
  ])('puts %s on the London date %s', (instant, expected) => {
    expect(toLondonDate({ instant })).toBe(expected);
  });

  it.each(['nope', '', '2026-13-45T00:00:00Z'])('is undefined for %j', (instant) => {
    expect(toLondonDate({ instant })).toBeUndefined();
  });
});
