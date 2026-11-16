import { addDays } from './index.ts';

describe('addDays', () => {
  it.each([
    ['2026-11-01', -31, '2026-10-01'],
    ['2026-11-30', 1, '2026-12-01'],
    ['2026-12-31', 1, '2027-01-01'],
    ['2028-02-28', 1, '2028-02-29'],
    ['2026-03-01', -1, '2026-02-28'],
    ['2026-10-25', 0, '2026-10-25'],
  ])('moves %s by %i days to %s', (date, days, expected) => {
    expect(addDays({ date, days })).toBe(expected);
  });
});
