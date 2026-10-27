import { getToday } from '.';

describe('getToday', () => {
  it('returns the London date, not the UTC date', () => {
    expect(getToday({ now: new Date('2026-07-15T23:30:00.000Z') })).toBe('2026-07-16');
  });
});
