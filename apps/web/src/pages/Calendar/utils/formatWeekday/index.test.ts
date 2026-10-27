import { formatWeekday } from '.';

describe('formatWeekday', () => {
  it('abbreviates the weekday', () => {
    expect(formatWeekday({ date: '2026-11-03' })).toBe('Tue');
  });
});
