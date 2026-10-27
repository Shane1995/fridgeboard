import { formatMonthTitle } from '.';

describe('formatMonthTitle', () => {
  it('formats the month and year', () => {
    expect(formatMonthTitle({ date: '2026-11-03' })).toBe('November 2026');
  });
});
