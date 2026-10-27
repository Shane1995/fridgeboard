import { buildWeek } from '.';

describe('buildWeek', () => {
  it('starts on Sunday', () => {
    const week = buildWeek({ date: '2026-11-04', weekStartsOn: 0 });
    expect(week[0]).toBe('2026-11-01');
    expect(week[6]).toBe('2026-11-07');
  });

  it('starts on Monday', () => {
    const week = buildWeek({ date: '2026-11-01', weekStartsOn: 1 });
    expect(week[0]).toBe('2026-10-26');
    expect(week[6]).toBe('2026-11-01');
  });
});
