import { eventDateRange } from '.';

const base = { id: 'a', title: 'Thing', ownerId: 'household', note: '' };

describe('eventDateRange', () => {
  it('returns the dates of an all-day event', () => {
    expect(
      eventDateRange({
        event: { ...base, allDay: true, startDate: '2026-11-03', endDate: '2026-11-03' },
      }),
    ).toEqual({ startDate: '2026-11-03', endDate: '2026-11-03' });
  });

  it('uses London dates for a timed event that crosses midnight', () => {
    expect(
      eventDateRange({
        event: {
          ...base,
          allDay: false,
          startsAt: '2026-07-15T21:00:00.000Z',
          endsAt: '2026-07-15T23:30:00.000Z',
        },
      }),
    ).toEqual({ startDate: '2026-07-15', endDate: '2026-07-16' });
  });
});
