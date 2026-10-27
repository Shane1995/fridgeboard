import { parseDate } from '.';

describe('parseDate', () => {
  it('splits a date into year, zero-based month and day', () => {
    expect(parseDate({ date: '2026-11-03' })).toEqual({ year: 2026, month: 10, day: 3 });
  });
});
