import { addDays } from '.';

describe('addDays', () => {
  it('moves forward across a month end', () => {
    expect(addDays({ date: '2026-10-30', days: 3 })).toBe('2026-11-02');
  });

  it('moves backward across a year start', () => {
    expect(addDays({ date: '2026-01-02', days: -3 })).toBe('2025-12-30');
  });

  it('is unaffected by the clock change', () => {
    expect(addDays({ date: '2026-03-28', days: 2 })).toBe('2026-03-30');
  });
});
