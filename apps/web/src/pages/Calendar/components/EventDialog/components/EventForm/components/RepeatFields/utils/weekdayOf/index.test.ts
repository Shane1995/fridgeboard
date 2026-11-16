import { weekdayOf } from '.';

describe('weekdayOf', () => {
  it.each([
    ['2026-11-01', 0],
    ['2026-11-05', 4],
    ['2026-11-07', 6],
  ])('puts %s on weekday %i (Sunday is 0)', (date, expected) => {
    expect(weekdayOf({ date })).toBe(expected);
  });
});
