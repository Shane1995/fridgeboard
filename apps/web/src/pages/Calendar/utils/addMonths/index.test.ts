import { addMonths } from '.';

describe('addMonths', () => {
  it('moves to the next month keeping the day', () => {
    expect(addMonths({ date: '2026-10-15', months: 1 })).toBe('2026-11-15');
  });

  it('clamps to the last day of a shorter month', () => {
    expect(addMonths({ date: '2026-01-31', months: 1 })).toBe('2026-02-28');
  });

  it('rolls over the year in both directions', () => {
    expect(addMonths({ date: '2026-12-10', months: 1 })).toBe('2027-01-10');
    expect(addMonths({ date: '2026-01-10', months: -1 })).toBe('2025-12-10');
  });
});
