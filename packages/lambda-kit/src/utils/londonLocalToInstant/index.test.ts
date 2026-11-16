import { londonLocalToInstant } from './index.ts';

describe('londonLocalToInstant', () => {
  it.each([
    ['2026-07-01', '09:00', '2026-07-01T08:00:00Z'],
    ['2026-01-15', '09:00', '2026-01-15T09:00:00Z'],
    ['2026-03-28', '12:00', '2026-03-28T12:00:00Z'],
    ['2026-03-29', '12:00', '2026-03-29T11:00:00Z'],
    ['2026-10-24', '18:00', '2026-10-24T17:00:00Z'],
    ['2026-10-25', '12:00', '2026-10-25T12:00:00Z'],
    ['2026-07-02', '00:30', '2026-07-01T23:30:00Z'],
  ])('puts London %s %s at %s', (date, time, expected) => {
    expect(londonLocalToInstant({ date, time })).toBe(expected);
  });
});
