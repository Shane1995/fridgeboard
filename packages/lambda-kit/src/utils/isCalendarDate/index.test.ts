import { isCalendarDate } from './index.ts';

describe('isCalendarDate', () => {
  it.each(['2026-11-15', '2028-02-29', '2026-12-31'])('accepts %s', (value) => {
    expect(isCalendarDate(value)).toBe(true);
  });

  it.each([
    '2026-02-30',
    '2027-02-29',
    '2026-13-01',
    '2026-1-1',
    '26-01-01',
    '',
    'nope',
    '2026-11-15T10:00',
  ])('rejects %j', (value) => {
    expect(isCalendarDate(value)).toBe(false);
  });

  it('rejects a value that is not a string', () => {
    expect(isCalendarDate(20261115)).toBe(false);
  });
});
