import { formatDayHeading } from '.';

describe('formatDayHeading', () => {
  it('formats weekday, day and month', () => {
    expect(formatDayHeading({ date: '2026-11-03' })).toBe('Tuesday 3 November');
  });
});
