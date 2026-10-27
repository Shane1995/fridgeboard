import { buildMonthGrid } from '.';

describe('buildMonthGrid', () => {
  it('pads November 2026 from the Sunday before the 1st', () => {
    const grid = buildMonthGrid({ date: '2026-11-15', weekStartsOn: 0 });
    expect(grid).toHaveLength(5);
    expect(grid[0]?.[0]).toEqual({ date: '2026-11-01', inMonth: true });
    expect(grid[4]?.[6]).toEqual({ date: '2026-12-05', inMonth: false });
  });

  it('marks leading days from the previous month as outside', () => {
    const grid = buildMonthGrid({ date: '2026-10-10', weekStartsOn: 0 });
    expect(grid[0]?.[0]).toEqual({ date: '2026-09-27', inMonth: false });
    expect(grid[0]?.[4]).toEqual({ date: '2026-10-01', inMonth: true });
  });

  it('uses six rows when the month needs them', () => {
    expect(buildMonthGrid({ date: '2026-08-01', weekStartsOn: 0 })).toHaveLength(6);
  });

  it('honours a Monday start', () => {
    const grid = buildMonthGrid({ date: '2026-11-15', weekStartsOn: 1 });
    expect(grid[0]?.[0]).toEqual({ date: '2026-10-26', inMonth: false });
  });
});
