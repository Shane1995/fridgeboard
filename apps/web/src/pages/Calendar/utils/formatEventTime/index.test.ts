import { formatEventTime } from '.';

const base = { id: 'e1', title: 'Thing', ownerId: 'household', note: '' };

describe('formatEventTime', () => {
  it('labels all-day events', () => {
    expect(
      formatEventTime({
        event: { ...base, allDay: true, startDate: '2026-11-03', endDate: '2026-11-03' },
      }),
    ).toBe('All day');
  });

  it('shows a London time range', () => {
    expect(
      formatEventTime({
        event: {
          ...base,
          allDay: false,
          startsAt: '2026-07-15T08:00:00.000Z',
          endsAt: '2026-07-15T09:30:00.000Z',
        },
      }),
    ).toBe('09:00\u201310:30');
  });

  it('flags an event that ends the next day', () => {
    expect(
      formatEventTime({
        event: {
          ...base,
          allDay: false,
          startsAt: '2026-11-03T22:00:00.000Z',
          endsAt: '2026-11-04T01:00:00.000Z',
        },
      }),
    ).toBe('22:00\u201301:00 +1');
  });
});
