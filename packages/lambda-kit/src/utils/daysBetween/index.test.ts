import { daysBetween } from './index.ts';

describe('daysBetween', () => {
  it.each([
    ['2026-11-01', '2026-11-01', 0],
    ['2026-11-01', '2026-12-02', 31],
    ['2026-10-24', '2026-10-26', 2],
    ['2026-11-05', '2026-11-01', -4],
  ])('counts from %s to %s as %i days', (from, to, expected) => {
    expect(daysBetween({ from, to })).toBe(expected);
  });
});
