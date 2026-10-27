import { fromLondonParts } from '.';

describe('fromLondonParts', () => {
  it('treats winter wall time as UTC', () => {
    expect(fromLondonParts({ date: '2026-01-15', time: '10:30' })).toBe('2026-01-15T10:30:00.000Z');
  });

  it('subtracts an hour in summer', () => {
    expect(fromLondonParts({ date: '2026-07-15', time: '10:30' })).toBe('2026-07-15T09:30:00.000Z');
  });

  it('handles the day after the clocks go forward', () => {
    expect(fromLondonParts({ date: '2026-03-30', time: '09:00' })).toBe('2026-03-30T08:00:00.000Z');
  });

  it('handles the day after the clocks go back', () => {
    expect(fromLondonParts({ date: '2026-10-26', time: '09:00' })).toBe('2026-10-26T09:00:00.000Z');
  });
});
