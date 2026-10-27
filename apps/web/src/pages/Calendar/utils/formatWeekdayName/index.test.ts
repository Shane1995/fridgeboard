import { formatWeekdayName } from '.';

describe('formatWeekdayName', () => {
  it('names weekdays from Sunday as zero', () => {
    expect(formatWeekdayName({ weekday: 0 })).toBe('Sunday');
    expect(formatWeekdayName({ weekday: 3 })).toBe('Wednesday');
    expect(formatWeekdayName({ weekday: 6 })).toBe('Saturday');
  });
});
